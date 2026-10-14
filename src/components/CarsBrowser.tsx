"use client";

// Catalog results are fetched from the visitor's browser: Encar drops
// connections from Vercel's datacenter IPs but allows CORS from any origin.
import { Suspense, useEffect, useState } from "react";
import CarCard from "@/components/CarCard";
import CarCardSkeleton from "@/components/CarCardSkeleton";
import SearchFilters from "@/components/SearchFilters";
import { EncarSearchResult } from "@/lib/encar";
import { CarsFilters, buildCarsQuery, searchCars } from "@/lib/encar-client";
import Link from "next/link";

export default function CarsBrowser({ searchParams }: { searchParams: CarsFilters }) {
  const [data, setData] = useState<EncarSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(searchParams);

  useEffect(() => {
    const ctrl = new AbortController();
    const { q, sr } = buildCarsQuery(searchParams);
    setLoading(true);
    searchCars(q, sr, { signal: ctrl.signal }).then((d) => {
      if (ctrl.signal.aborted) return;
      setData(d);
      setLoading(false);
    });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

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
            : loading ? "Duke kerkuar..." : "0 vetura te gjetura"}
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

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }, (_, i) => <CarCardSkeleton key={i} />)}
            </div>
          ) : cars.length > 0 ? (
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

function SortSelect({ searchParams }: { searchParams: CarsFilters }) {
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
  searchParams: CarsFilters;
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
