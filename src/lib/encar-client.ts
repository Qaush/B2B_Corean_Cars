// Encar API calls made from the visitor's browser.
//
// Encar drops connections from cloud/datacenter IPs (Vercel iad1, fra1 and
// even icn1 all fail with "fetch failed"), while api.encar.com answers
// browsers with `Access-Control-Allow-Origin: *`. So every catalog request is
// made client-side, from the visitor's own IP, instead of from a server route.

import { EncarCar, EncarSearchResult, isImportedBrand } from "./encar";

const ENCAR = "https://api.encar.com";
const PREMIUM = `${ENCAR}/search/car/list/premium`;
const GENERAL = `${ENCAR}/search/car/list/general`;

async function getJson<T = any>(url: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function searchCars(
  q: string,
  sr: string,
  opts: { endpoint?: string; inav?: string; signal?: AbortSignal } = {}
): Promise<EncarSearchResult | null> {
  let url = `${opts.endpoint || PREMIUM}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;
  if (opts.inav) url += `&inav=${encodeURIComponent(opts.inav)}`;
  return getJson<EncarSearchResult>(url, opts.signal);
}

export interface CarsFilters {
  manufacturer?: string;
  model?: string;
  badge?: string;
  fuelType?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  maxMileage?: string;
  sort?: string;
  offset?: string;
}

// Same query the server-rendered /cars page used to build.
export function buildCarsQuery(f: CarsFilters): { q: string; sr: string } {
  const conditions = ["Hidden.N"];
  if (f.manufacturer) conditions.push(`Manufacturer.${f.manufacturer}`);
  if (f.model) conditions.push(`ModelGroup.${f.model}`);
  if (f.badge) conditions.push(`Badge.${f.badge}`);
  if (f.fuelType) conditions.push(`FuelType.${f.fuelType}`);
  const minPrice = f.minPrice ? parseInt(f.minPrice) : undefined;
  const maxPrice = f.maxPrice ? parseInt(f.maxPrice) : undefined;
  if (minPrice || maxPrice) conditions.push(`Price.range(${minPrice || ""}..${maxPrice || ""})`);
  if (f.minYear) conditions.push(`Year.range(${parseInt(f.minYear)}00..)`);
  if (f.maxMileage) conditions.push(`Mileage.range(..${parseInt(f.maxMileage)})`);

  const q = `(And.${conditions.join("._.")}.)`;
  const sr = `|${f.sort || "ModifiedDate"}|${f.offset || "0"}|20`;
  return { q, sr };
}

export type Facets = Record<string, Array<{ value: string; count: number }>>;

// Model/Badge facets for the search filters (formerly /api/models).
export async function getFacets(manufacturer: string, model?: string): Promise<Facets> {
  const imported = isImportedBrand(manufacturer);
  const conditions = ["Hidden.N"];
  if (imported) conditions.push("CarType.N");
  conditions.push(`Manufacturer.${manufacturer}`);
  if (model) conditions.push(`ModelGroup.${model}`);

  const data: any = await searchCars(`(And.${conditions.join("._.")}.)`, "|ModifiedDate|0|0", {
    endpoint: imported ? GENERAL : PREMIUM,
    inav: model ? "|Metadata|Badge|FuelType|Transmission" : "|Metadata|ModelGroup|FuelType",
  });

  const result: Facets = {};
  for (const node of data?.iNav?.Nodes || []) {
    if (node.Name === "Metadata" || node.Name === "Hidden" || node.Name === "CarType") continue;

    // Direct facets (non-selected items)
    const direct = (node.Facets || []).filter(
      (f: any) => f.Count > 0 && f.Value !== "N" && f.Value !== "Y" && !f.IsSelected
    );
    if (direct.length > 0) {
      result[node.Name] = direct
        .map((f: any) => ({ value: f.Value, count: f.Count }))
        .sort((a: any, b: any) => b.count - a.count);
    }

    // Refinement facets nested inside selected facets (e.g. Manufacturer > ModelGroup)
    for (const facet of node.Facets || []) {
      for (const refNode of facet.Refinements?.Nodes || []) {
        if (refNode.Facets?.length > 0) {
          result[refNode.Name] = refNode.Facets
            .filter((f: any) => f.Count > 0)
            .map((f: any) => ({ value: f.Value, count: f.Count }))
            .sort((a: any, b: any) => b.count - a.count);
        }
      }
    }
  }
  return result;
}

export interface CarDetailData {
  car: EncarCar;
  detail: any;
  accidentSummary: any;
  inspectionSummary: any;
  diagnosis: any;
  performanceData: Record<string, string[] | null> | null;
}

export async function getCarDetail(id: string): Promise<CarDetailData | null> {
  let car: EncarCar | null = null;
  const q = `(And.Hidden.N._.CarId.${id}.)`;
  for (const endpoint of [PREMIUM, GENERAL]) {
    const data = await searchCars(q, "|ModifiedDate|0|1", { endpoint });
    if (data?.SearchResults?.length) {
      car = data.SearchResults[0];
      break;
    }
  }
  if (!car) return null;

  // The vehicle API returns the same object fem.encar.com embeds as
  // __PRELOADED_STATE__.cars.base (photos, spec, options, category...).
  const [vehicle, accident, inspection, diag] = await Promise.all([
    getJson(`${ENCAR}/v1/readside/vehicle/${id}`),
    getJson(`${ENCAR}/v1/readside/record/vehicle/${id}/summary`),
    getJson(`${ENCAR}/v1/readside/inspection/vehicle/${id}/summary`),
    getJson(`${ENCAR}/v1/readside/diagnosis/vehicle/${id}`),
  ]);
  const detail = vehicle ? { cars: { base: vehicle } } : null;
  let accidentSummary: any = accident;
  let inspectionSummary: any = inspection;
  let diagnosis: any = diag;

  // For DUPLICATION cars, report APIs may 404 with the listing ID.
  // Find the original car ID from the photo paths and retry.
  let effectiveId = id;
  if (!accidentSummary || !inspectionSummary || !diagnosis) {
    const photoPath: string = vehicle?.photos?.[0]?.path || "";
    const origId = photoPath.match(/\/pic\d+\/(\d+)_/)?.[1];
    if (origId && origId !== id) {
      effectiveId = origId;
      const [a, i, d] = await Promise.all([
        accidentSummary ? null : getJson(`${ENCAR}/v1/readside/record/vehicle/${origId}/summary`),
        inspectionSummary ? null : getJson(`${ENCAR}/v1/readside/inspection/vehicle/${origId}/summary`),
        diagnosis ? null : getJson(`${ENCAR}/v1/readside/diagnosis/vehicle/${origId}`),
      ]);
      accidentSummary = accidentSummary || a;
      inspectionSummary = inspectionSummary || i;
      diagnosis = diagnosis || d;
    }
  }

  // Detailed accident data with costs
  if (accidentSummary?.carNo) {
    const open: any = await getJson(
      `${ENCAR}/v1/readside/record/vehicle/${effectiveId}/open?vehicleNo=${encodeURIComponent(accidentSummary.carNo)}`
    );
    if (open?.openData) accidentSummary = open;
  }

  // The damage diagram came from scraping www.encar.com HTML, which has no
  // CORS headers, so it can't be read from the browser.
  return { car, detail, accidentSummary, inspectionSummary, diagnosis, performanceData: null };
}
