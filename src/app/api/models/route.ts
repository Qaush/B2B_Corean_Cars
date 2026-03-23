import { NextRequest, NextResponse } from "next/server";
import { isImportedBrand } from "@/lib/encar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const manufacturer = searchParams.get("manufacturer");
  const model = searchParams.get("model");

  if (!manufacturer) {
    return NextResponse.json({ error: "manufacturer required" }, { status: 400 });
  }

  const isImported = isImportedBrand(manufacturer);
  const endpoint = isImported
    ? "https://api.encar.com/search/car/list/general"
    : "https://api.encar.com/search/car/list/premium";

  // Build query
  let conditions = ["Hidden.N"];
  if (isImported) conditions.push("CarType.N");
  conditions.push(`Manufacturer.${manufacturer}`);
  if (model) conditions.push(`ModelGroup.${model}`);

  const q = `(And.${conditions.join("._.")}.)`;

  // Request facets for Model/Badge
  const inav = model
    ? "|Metadata|Badge|FuelType|Transmission"
    : "|Metadata|ModelGroup|FuelType";

  const url = `${endpoint}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent("|ModifiedDate|0|0")}&inav=${encodeURIComponent(inav)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "API error" }, { status: res.status });
    }

    const data = await res.json();

    // Extract facets from iNav
    const nodes = data?.iNav?.Nodes || [];
    const result: Record<string, Array<{ value: string; count: number }>> = {};

    for (const node of nodes) {
      if (node.Name === "Metadata" || node.Name === "Hidden" || node.Name === "CarType") continue;

      // Check direct facets (non-selected items)
      if (node.Facets && node.Facets.length > 0) {
        const directFacets = node.Facets
          .filter((f: any) => f.Count > 0 && f.Value !== "N" && f.Value !== "Y" && !f.IsSelected);
        if (directFacets.length > 0) {
          result[node.Name] = directFacets
            .map((f: any) => ({ value: f.Value, count: f.Count }))
            .sort((a: any, b: any) => b.count - a.count);
        }
      }

      // Check refinement facets (nested inside selected facets, e.g., Manufacturer > ModelGroup)
      if (node.Facets) {
        for (const facet of node.Facets) {
          if (facet.Refinements?.Nodes) {
            for (const refNode of facet.Refinements.Nodes) {
              if (refNode.Facets && refNode.Facets.length > 0) {
                result[refNode.Name] = refNode.Facets
                  .filter((f: any) => f.Count > 0)
                  .map((f: any) => ({ value: f.Value, count: f.Count }))
                  .sort((a: any, b: any) => b.count - a.count);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ count: data.Count, facets: result });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
