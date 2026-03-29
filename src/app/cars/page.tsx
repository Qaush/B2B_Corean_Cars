import { Suspense } from "react";
import CarCard from "@/components/CarCard";
import CarCardSkeleton from "@/components/CarCardSkeleton";
import SearchFilters from "@/components/SearchFilters";
import { EncarSearchResult, buildSearchQueryWithType, getApiEndpoint } from "@/lib/encar";
import Link from "next/link";

interface CarsPageProps {
  searchParams: {
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
  };
}

async function getCars(searchParams: CarsPageProps["searchParams"]): Promise<EncarSearchResult | null> {
  const filters = {
    manufacturer: searchParams.manufacturer,
    model: searchParams.model,
    badge: searchParams.badge,
    fuelType: searchParams.fuelType,
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
    minYear: searchParams.minYear ? parseInt(searchParams.minYear) : undefined,
    maxYear: searchParams.maxYear ? parseInt(searchParams.maxYear) : undefined,
    maxMileage: searchParams.maxMileage ? parseInt(searchParams.maxMileage) : undefined,
  };

  // Build simple query without CarType (works with premium endpoint for all brands)
  let conditions = ["Hidden.N"];
  if (filters.manufacturer) conditions.push(`Manufacturer.${filters.manufacturer}`);
  if (filters.model) conditions.push(`ModelGroup.${filters.model}`);
  if (filters.badge) conditions.push(`Badge.${filters.badge}`);
  if (filters.fuelType) conditions.push(`FuelType.${filters.fuelType}`);
  if (filters.minPrice || filters.maxPrice) {
    conditions.push(`Price.range(${filters.minPrice || ""}..${filters.maxPrice || ""})`);
  }
  if (filters.minYear) conditions.push(`Year.range(${filters.minYear}00..)`);
  if (filters.maxMileage) conditions.push(`Mileage.range(..${filters.maxMileage})`);

  const q = `(And.${conditions.join("._.")}.)`;
  const sort = searchParams.sort || "ModifiedDate";
  const offset = searchParams.offset || "0";
  const sr = `|${sort}|${offset}|20`;
  const url = `https://api.encar.com/search/car/list/premium?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  };

  try {
    const res = await fetch(url, { headers, next: { revalidate: 300 } });
    if (res.ok) return res.json();
    return null;
  } catch {
    return null;
  }
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const data = await getCars(searchParams);
  const cars = data?.SearchResults || [];
  const totalCount = data?.Count || 0;
  const currentOffset = parseInt(searchParams.offset || "0");
  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPage = Math.floor(currentOffset / pageSize) + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Veturat</h1>
        <p className="text-gray-400 mt-1 text-sm">
          {totalCount > 0
            ? `${new Intl.NumberFormat("de-DE").format(totalCount)} vetura te gjetura`
            : "Duke kerkuar..."}
        </p>
      </div>

      {/* Layout: Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar Filters */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Suspense fallback={<div className="h-96 skeleton rounded-2xl" />}>
            <SearchFilters />
          </Suspense>
        </div>

        {/* Results */}
        <div>
          {/* Sort - top of results */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {totalCount > 0 && `Faqja ${currentPage} nga ${totalPages}`}
            </p>
            <SortSelect searchParams={searchParams} />
          </div>

          {cars.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cars.map((car) => (
                  <CarCard key={car.Id} car={car} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {currentPage > 1 && (
                    <PaginationLink searchParams={searchParams} offset={((currentPage - 2) * pageSize).toString()} label="Prapa" />
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <PaginationLink
                        key={pageNum}
                        searchParams={searchParams}
                        offset={((pageNum - 1) * pageSize).toString()}
                        label={pageNum.toString()}
                        active={pageNum === currentPage}
                      />
                    );
                  })}
                  {currentPage < totalPages && (
                    <PaginationLink searchParams={searchParams} offset={(currentPage * pageSize).toString()} label="Para" />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nuk u gjeten vetura</h3>
              <p className="text-gray-400">
                Provoni te ndryshoni filtrat ose{" "}
                <Link href="/cars" className="text-red-600 hover:underline">shikoni te gjitha veturat</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortSelect({ searchParams }: { searchParams: CarsPageProps["searchParams"] }) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "sort" && key !== "offset") params.set(key, value);
  });

  const sorts = [
    { value: "ModifiedDate", label: "Me te rejat" },
    { value: "PriceAsc", label: "Cmimi: ulet → larte" },
    { value: "PriceDesc", label: "Cmimi: larte → ulet" },
    { value: "MileageAsc", label: "Km me pak" },
    { value: "Year", label: "Viti me ri" },
  ];

  return (
    <div className="flex items-center gap-2">
      {sorts.map((s) => {
        const p = new URLSearchParams(params);
        if (s.value !== "ModifiedDate") p.set("sort", s.value);
        const isActive = (searchParams.sort || "ModifiedDate") === s.value;
        return (
          <Link
            key={s.value}
            href={`/cars?${p.toString()}`}
            className={`hidden md:block text-xs px-3 py-1.5 rounded-full transition-colors ${
              isActive ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}

function PaginationLink({
  searchParams,
  offset,
  label,
  active = false,
}: {
  searchParams: CarsPageProps["searchParams"];
  offset: string;
  label: string;
  active?: boolean;
}) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "offset") params.set(key, value);
  });
  if (offset !== "0") params.set("offset", offset);

  return (
    <Link
      href={`/cars?${params.toString()}`}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
      }`}
    >
      {label}
    </Link>
  );
}
