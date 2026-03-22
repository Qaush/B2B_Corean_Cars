import { NextRequest, NextResponse } from "next/server";

const ENCAR_API = "https://api.encar.com/search/car/list/premium";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") || "(And.Hidden.N.)";
  const offset = searchParams.get("offset") || "0";
  const count = searchParams.get("count") || "20";
  const sort = searchParams.get("sort") || "ModifiedDate";

  const sr = `|${sort}|${offset}|${count}`;
  const inav = "|Metadata|Sort|Manufacturer|Model|FuelType|Mileage|Price|Year|Transmission";

  const url = `${ENCAR_API}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}&inav=${encodeURIComponent(inav)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Encar" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
