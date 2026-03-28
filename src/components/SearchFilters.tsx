"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { translateModel, translateBadge, translateFuelType } from "@/lib/encar";

const MANUFACTURERS = [
  { value: "", label: "Te gjitha markat", group: "" },
  { value: "현대", label: "Hyundai", group: "Koreane" },
  { value: "기아", label: "Kia", group: "Koreane" },
  { value: "제네시스", label: "Genesis", group: "Koreane" },
  { value: "쉐보레(GM대우)", label: "Chevrolet (KR)", group: "Koreane" },
  { value: "르노코리아(삼성)", label: "Renault Korea", group: "Koreane" },
  { value: "KG모빌리티(쌍용)", label: "KG Mobility", group: "Koreane" },
  { value: "BMW", label: "BMW", group: "Premium" },
  { value: "벤츠", label: "Mercedes-Benz", group: "Premium" },
  { value: "아우디", label: "Audi", group: "Premium" },
  { value: "포르쉐", label: "Porsche", group: "Premium" },
  { value: "벤틀리", label: "Bentley", group: "Premium" },
  { value: "마세라티", label: "Maserati", group: "Premium" },
  { value: "폭스바겐", label: "Volkswagen", group: "Europiane" },
  { value: "볼보", label: "Volvo", group: "Europiane" },
  { value: "미니", label: "MINI", group: "Europiane" },
  { value: "랜드로버", label: "Land Rover", group: "Europiane" },
  { value: "푸조", label: "Peugeot", group: "Europiane" },
  { value: "포드", label: "Ford", group: "Amerikane" },
  { value: "테슬라", label: "Tesla", group: "Amerikane" },
  { value: "지프", label: "Jeep", group: "Amerikane" },
  { value: "캐딜락", label: "Cadillac", group: "Amerikane" },
  { value: "렉서스", label: "Lexus", group: "Japoneze" },
  { value: "도요타", label: "Toyota", group: "Japoneze" },
  { value: "혼다", label: "Honda", group: "Japoneze" },
  { value: "닛산", label: "Nissan", group: "Japoneze" },
  { value: "인피니티", label: "Infiniti", group: "Japoneze" },
];

const YEAR_RANGE = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i);

interface FacetItem {
  value: string;
  count: number;
}

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const manufacturer = searchParams.get("manufacturer") || "";
  const model = searchParams.get("model") || "";
  const badge = searchParams.get("badge") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const minYear = searchParams.get("minYear") || "";
  const maxMileage = searchParams.get("maxMileage") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const [models, setModels] = useState<FacetItem[]>([]);
  const [badges, setBadges] = useState<FacetItem[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingBadges, setLoadingBadges] = useState(false);

  useEffect(() => {
    if (!manufacturer) { setModels([]); setBadges([]); return; }
    setLoadingModels(true);
    fetch(`/api/models?manufacturer=${encodeURIComponent(manufacturer)}`)
      .then((res) => res.json())
      .then((data) => { setModels(data.facets?.ModelGroup || []); setBadges([]); })
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, [manufacturer]);

  useEffect(() => {
    if (!manufacturer || !model) { setBadges([]); return; }
    setLoadingBadges(true);
    fetch(`/api/models?manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`)
      .then((res) => res.json())
      .then((data) => setBadges(data.facets?.Badge || []))
      .catch(() => setBadges([]))
      .finally(() => setLoadingBadges(false));
  }, [manufacturer, model]);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value); else params.delete(key);
      }
      params.delete("offset");
      router.push(`/cars?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setManufacturer_ = (value: string) => updateFilters({ manufacturer: value, model: "", badge: "" });
  const setModel_ = (value: string) => updateFilters({ model: value, badge: "" });
  const clearFilters = () => router.push("/cars");

  const hasFilters = manufacturer || fuelType || minYear || maxMileage || model || badge || minPrice || maxPrice;

  const selectClass =
    "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none appearance-none cursor-pointer";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between p-4 text-gray-700 font-semibold"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtro
          {hasFilters && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Aktiv</span>}
        </span>
        <svg className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters content */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block p-4 lg:pt-4 space-y-5`}>
        {/* Header - desktop only */}
        <div className="hidden lg:flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Filtrat</h3>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-600 transition-colors">
              Pastro te gjitha
            </button>
          )}
        </div>

        {/* Manufacturer */}
        <FilterGroup label="Marka">
          <select value={manufacturer} onChange={(e) => setManufacturer_(e.target.value)} className={selectClass}>
            <option value="">Te gjitha</option>
            {(() => {
              const groups: Record<string, typeof MANUFACTURERS> = {};
              MANUFACTURERS.filter((m) => m.group).forEach((m) => {
                if (!groups[m.group]) groups[m.group] = [];
                groups[m.group].push(m);
              });
              return Object.entries(groups).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </optgroup>
              ));
            })()}
          </select>
        </FilterGroup>

        {/* Model */}
        <FilterGroup label="Modeli">
          <select
            value={model}
            onChange={(e) => setModel_(e.target.value)}
            disabled={!manufacturer || loadingModels}
            className={`${selectClass} ${!manufacturer ? "opacity-40" : ""}`}
          >
            <option value="">{loadingModels ? "Duke ngarkuar..." : manufacturer ? `Te gjitha (${models.length})` : "Zgjidh marken pare"}</option>
            {models.map((m) => <option key={m.value} value={m.value}>{translateModel(m.value)} ({m.count})</option>)}
          </select>
        </FilterGroup>

        {/* Badge */}
        {badges.length > 0 && (
          <FilterGroup label="Varianti">
            <select value={badge} onChange={(e) => updateFilters({ badge: e.target.value })} disabled={loadingBadges} className={selectClass}>
              <option value="">Te gjitha</option>
              {badges.map((b) => <option key={b.value} value={b.value}>{translateBadge(b.value)} ({b.count})</option>)}
            </select>
          </FilterGroup>
        )}

        {/* Fuel Type */}
        <FilterGroup label="Karburanti">
          <select value={fuelType} onChange={(e) => updateFilters({ fuelType: e.target.value })} className={selectClass}>
            <option value="">Te gjitha</option>
            <option value="가솔린">Benzine</option>
            <option value="디젤">Diesel</option>
            <option value="LPG">LPG</option>
            <option value="가솔린+전기">Hybrid</option>
            <option value="전기">Elektrik</option>
            <option value="수소">Hidrogjen</option>
          </select>
        </FilterGroup>

        {/* Year */}
        <FilterGroup label="Viti (min)">
          <select value={minYear} onChange={(e) => updateFilters({ minYear: e.target.value })} className={selectClass}>
            <option value="">Pa limit</option>
            {YEAR_RANGE.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </FilterGroup>

        {/* Price range */}
        <FilterGroup label="Cmimi (EUR)">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => updateFilters({ minPrice: e.target.value })}
              className={selectClass}
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => updateFilters({ maxPrice: e.target.value })}
              className={selectClass}
            />
          </div>
        </FilterGroup>

        {/* Mileage */}
        <FilterGroup label="Km max">
          <select value={maxMileage} onChange={(e) => updateFilters({ maxMileage: e.target.value })} className={selectClass}>
            <option value="">Pa limit</option>
            <option value="10000">Deri 10,000 km</option>
            <option value="30000">Deri 30,000 km</option>
            <option value="50000">Deri 50,000 km</option>
            <option value="80000">Deri 80,000 km</option>
            <option value="100000">Deri 100,000 km</option>
            <option value="150000">Deri 150,000 km</option>
          </select>
        </FilterGroup>

        {/* Active filters tags */}
        {hasFilters && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
            {manufacturer && <FilterTag label={MANUFACTURERS.find((m) => m.value === manufacturer)?.label || manufacturer} onRemove={() => setManufacturer_("")} />}
            {model && <FilterTag label={translateModel(model)} onRemove={() => setModel_("")} />}
            {fuelType && <FilterTag label={translateFuelType(fuelType)} onRemove={() => updateFilters({ fuelType: "" })} />}
            {minYear && <FilterTag label={`Nga ${minYear}`} onRemove={() => updateFilters({ minYear: "" })} />}
            {maxMileage && <FilterTag label={`Deri ${parseInt(maxMileage).toLocaleString()} km`} onRemove={() => updateFilters({ maxMileage: "" })} />}
            {minPrice && <FilterTag label={`Min ${minPrice}€`} onRemove={() => updateFilters({ minPrice: "" })} />}
            {maxPrice && <FilterTag label={`Max ${maxPrice}€`} onRemove={() => updateFilters({ maxPrice: "" })} />}
          </div>
        )}

        {/* Mobile clear + apply */}
        {hasFilters && (
          <button onClick={clearFilters} className="lg:hidden w-full text-center text-sm text-gray-500 hover:text-red-600 py-2">
            Pastro te gjitha filtrat
          </button>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="text-gray-400 hover:text-red-600">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
