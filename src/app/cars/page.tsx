import { Suspense } from "react";
import CarCard from "@/components/CarCard";
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

  const q = buildSearchQueryWithType(filters);
  const endpoint = getApiEndpoint(searchParams.manufacturer);

  const sort = searchParams.sort || "ModifiedDate";
  const offset = searchParams.offset || "0";
  const count = "20";
  const sr = `|${sort}|${offset}|${count}`;

  const url = `${endpoint}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;
    return res.json();
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Veturat e disponueshme
        </h1>
        <p className="text-gray-500 mt-1">
          {totalCount > 0
            ? `${new Intl.NumberFormat("de-DE").format(totalCount)} vetura te gjetura`
            : "Duke kerkuar..."}
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-16 bg-gray-100 rounded-xl animate-pulse" />}>
        <SearchFilters />
      </Suspense>

      {/* Results */}
      {cars.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {cars.map((car) => (
              <CarCard key={car.Id} car={car} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {currentPage > 1 && (
                <PaginationLink
                  searchParams={searchParams}
                  offset={((currentPage - 2) * pageSize).toString()}
                  label="Prapa"
                />
              )}

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
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
                <PaginationLink
                  searchParams={searchParams}
                  offset={(currentPage * pageSize).toString()}
                  label="Para"
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nuk u gjeten vetura
          </h3>
          <p className="text-gray-400">
            Provoni te ndryshoni filtrat ose{" "}
            <Link href="/cars" className="text-blue-600 hover:underline">
              shikoni te gjitha veturat
            </Link>
          </p>
        </div>
      )}
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
        active
          ? "bg-blue-600 text-white"
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
      }`}
    >
      {label}
    </Link>
  );
}
