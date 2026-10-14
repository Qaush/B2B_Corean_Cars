"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CarCard from "@/components/CarCard";
import CarCardSkeleton from "@/components/CarCardSkeleton";
import { EncarSearchResult } from "@/lib/encar";
import { searchCars } from "@/lib/encar-client";

// Featured cars + live catalog count for the home page, loaded from the
// visitor's browser (Encar blocks the Vercel servers' IPs).
function useLatestCars() {
  const [data, setData] = useState<EncarSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const ctrl = new AbortController();
    searchCars("(And.Hidden.N.)", "|ModifiedDate|0|8", { signal: ctrl.signal })
      .then((d) => { if (!ctrl.signal.aborted) { setData(d); setLoading(false); } });
    return () => ctrl.abort();
  }, []);
  return { data, loading };
}

export function CarCountStat() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    searchCars("(And.Hidden.N.)", "|ModifiedDate|0|0", { signal: ctrl.signal })
      .then((d) => { if (!ctrl.signal.aborted && d?.Count) setCount(d.Count); });
    return () => ctrl.abort();
  }, []);
  return <>{count ? Math.floor(count / 1000) + "K+" : "140K+"}</>;
}

export default function FeaturedCars() {
  const { data, loading } = useLatestCars();
  const cars = data?.SearchResults || [];
  if (!loading && cars.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Veturat me te reja
            </h2>
            <p className="text-gray-400 mt-1">Listime te reja cdo dite</p>
          </div>
          <Link
            href="/cars"
            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 text-sm"
          >
            Shiko te gjitha
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <CarCardSkeleton key={i} />)
            : cars.slice(0, 8).map((car) => <CarCard key={car.Id} car={car} />)}
        </div>
      </div>
    </section>
  );
}
