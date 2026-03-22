"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { translateModel, translateBadge } from "@/lib/encar";

const MANUFACTURERS = [
  { value: "", label: "Te gjitha markat", group: "" },
  // Korean
  { value: "현대", label: "Hyundai", group: "Koreane" },
  { value: "기아", label: "Kia", group: "Koreane" },
  { value: "제네시스", label: "Genesis", group: "Koreane" },
  { value: "쉐보레(GM대우)", label: "Chevrolet (KR)", group: "Koreane" },
  { value: "르노코리아(삼성)", label: "Renault Korea", group: "Koreane" },
  { value: "KG모빌리티(쌍용)", label: "KG Mobility", group: "Koreane" },
  // Premium
  { value: "BMW", label: "BMW", group: "Premium" },
  { value: "벤츠", label: "Mercedes-Benz", group: "Premium" },
  { value: "아우디", label: "Audi", group: "Premium" },
  { value: "포르쉐", label: "Porsche", group: "Premium" },
  { value: "벤틀리", label: "Bentley", group: "Premium" },
  { value: "롤스로이스", label: "Rolls-Royce", group: "Premium" },
  { value: "마세라티", label: "Maserati", group: "Premium" },
  { value: "페라리", label: "Ferrari", group: "Premium" },
  { value: "람보르기니", label: "Lamborghini", group: "Premium" },
  { value: "맥라렌", label: "McLaren", group: "Premium" },
  { value: "애스턴마틴", label: "Aston Martin", group: "Premium" },
  // European
  { value: "폭스바겐", label: "Volkswagen", group: "Europiane" },
  { value: "볼보", label: "Volvo", group: "Europiane" },
  { value: "미니", label: "MINI", group: "Europiane" },
  { value: "랜드로버", label: "Land Rover", group: "Europiane" },
  { value: "재규어", label: "Jaguar", group: "Europiane" },
  { value: "푸조", label: "Peugeot", group: "Europiane" },
  { value: "시트로엥/DS", label: "Citroen/DS", group: "Europiane" },
  { value: "피아트", label: "Fiat", group: "Europiane" },
  { value: "폴스타", label: "Polestar", group: "Europiane" },
  { value: "스마트", label: "Smart", group: "Europiane" },
  { value: "알파 로메오", label: "Alfa Romeo", group: "Europiane" },
  // American
  { value: "포드", label: "Ford", group: "Amerikane" },
  { value: "테슬라", label: "Tesla", group: "Amerikane" },
  { value: "지프", label: "Jeep", group: "Amerikane" },
  { value: "링컨", label: "Lincoln", group: "Amerikane" },
  { value: "캐딜락", label: "Cadillac", group: "Amerikane" },
  { value: "크라이슬러", label: "Chrysler", group: "Amerikane" },
  { value: "닷지", label: "Dodge", group: "Amerikane" },
  { value: "GMC", label: "GMC", group: "Amerikane" },
  // Japanese
  { value: "렉서스", label: "Lexus", group: "Japoneze" },
  { value: "도요타", label: "Toyota", group: "Japoneze" },
  { value: "혼다", label: "Honda", group: "Japoneze" },
  { value: "닛산", label: "Nissan", group: "Japoneze" },
  { value: "인피니티", label: "Infiniti", group: "Japoneze" },
  { value: "스즈키", label: "Suzuki", group: "Japoneze" },
  { value: "스바루", label: "Subaru", group: "Japoneze" },
  { value: "마쯔다", label: "Mazda", group: "Japoneze" },
  { value: "미쯔비시", label: "Mitsubishi", group: "Japoneze" },
];

const SORT_OPTIONS = [
  { value: "ModifiedDate", label: "Me te rejat" },
  { value: "PriceAsc", label: "Cmimi me i ulet" },
  { value: "PriceDsc", label: "Cmimi me i larte" },
  { value: "MileageAsc", label: "Kilometrazhi me i ulet" },
  { value: "YearDsc", label: "Viti me i ri" },
];

const YEAR_RANGE = Array.from({ length: 15 }, (_, i) => 2025 - i);

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
  const sort = searchParams.get("sort") || "ModifiedDate";
  const minYear = searchParams.get("minYear") || "";
  const maxMileage = searchParams.get("maxMileage") || "";

  const [models, setModels] = useState<FacetItem[]>([]);
  const [badges, setBadges] = useState<FacetItem[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FacetItem[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingBadges, setLoadingBadges] = useState(false);

  // Fetch models when manufacturer changes
  useEffect(() => {
    if (!manufacturer) {
      setModels([]);
      setBadges([]);
      setFuelTypes([]);
      return;
    }

    setLoadingModels(true);
    fetch(`/api/models?manufacturer=${encodeURIComponent(manufacturer)}`)
      .then((res) => res.json())
      .then((data) => {
        setModels(data.facets?.ModelGroup || []);
        setFuelTypes(data.facets?.FuelType || []);
        setBadges([]);
      })
      .catch(() => {
        setModels([]);
        setFuelTypes([]);
      })
      .finally(() => setLoadingModels(false));
  }, [manufacturer]);

  // Fetch badges when model changes
  useEffect(() => {
    if (!manufacturer || !model) {
      setBadges([]);
      return;
    }

    setLoadingBadges(true);
    fetch(
      `/api/models?manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setBadges(data.facets?.Badge || []);
        if (data.facets?.FuelType) setFuelTypes(data.facets.FuelType);
      })
      .catch(() => setBadges([]))
      .finally(() => setLoadingBadges(false));
  }, [manufacturer, model]);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete("offset");
      router.push(`/cars?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setManufacturer = (value: string) => {
    updateFilters({ manufacturer: value, model: "", badge: "" });
  };

  const setModel = (value: string) => {
    updateFilters({ model: value, badge: "" });
  };

  const clearFilters = () => {
    router.push("/cars");
  };

  const hasFilters = manufacturer || fuelType || minYear || maxMileage || model || badge;

  const selectClass =
    "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full flex items-center justify-between text-gray-700 font-semibold"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtro veturat
          {hasFilters && (
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
              Aktiv
            </span>
          )}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters */}
      <div className={`${isOpen ? "block" : "hidden"} md:block mt-4 md:mt-0 space-y-3`}>
        {/* Row 1: Manufacturer / Model / Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Manufacturer */}
          <select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className={selectClass}
          >
            <option value="">-- Zgjidh Marken --</option>
            {(() => {
              const groups: Record<string, typeof MANUFACTURERS> = {};
              MANUFACTURERS.filter((m) => m.group).forEach((m) => {
                if (!groups[m.group]) groups[m.group] = [];
                groups[m.group].push(m);
              });
              return Object.entries(groups).map(([group, items]) => (
                <optgroup key={group} label={`── ${group} ──`}>
                  {items.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              ));
            })()}
          </select>

          {/* Model */}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!manufacturer || loadingModels}
            className={`${selectClass} ${!manufacturer ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {loadingModels
                ? "Duke ngarkuar..."
                : manufacturer
                ? `-- Zgjidh Modelin (${models.length}) --`
                : "-- Fillimisht zgjidh marken --"}
            </option>
            {models.map((m) => (
              <option key={m.value} value={m.value}>
                {translateModel(m.value)} ({m.count})
              </option>
            ))}
          </select>

          {/* Badge / Variant */}
          <select
            value={badge}
            onChange={(e) => updateFilters({ badge: e.target.value })}
            disabled={!model || loadingBadges}
            className={`${selectClass} ${!model ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {loadingBadges
                ? "Duke ngarkuar..."
                : model
                ? `-- Zgjidh Variantin (${badges.length}) --`
                : "-- Fillimisht zgjidh modelin --"}
            </option>
            {badges.map((b) => (
              <option key={b.value} value={b.value}>
                {translateBadge(b.value)} ({b.count})
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Fuel / Year / Mileage / Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Fuel Type */}
          <select
            value={fuelType}
            onChange={(e) => updateFilters({ fuelType: e.target.value })}
            className={selectClass}
          >
            <option value="">Karburanti</option>
            {fuelTypes.length > 0
              ? fuelTypes.map((f) => (
                  <option key={f.value} value={f.value}>
                    {translateFuel(f.value)} ({f.count})
                  </option>
                ))
              : DEFAULT_FUELS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
          </select>

          {/* Min Year */}
          <select
            value={minYear}
            onChange={(e) => updateFilters({ minYear: e.target.value })}
            className={selectClass}
          >
            <option value="">Viti (nga)</option>
            {YEAR_RANGE.map((y) => (
              <option key={y} value={y}>
                {y}+
              </option>
            ))}
          </select>

          {/* Max Mileage */}
          <select
            value={maxMileage}
            onChange={(e) => updateFilters({ maxMileage: e.target.value })}
            className={selectClass}
          >
            <option value="">Km (max)</option>
            <option value="10000">deri 10,000 km</option>
            <option value="30000">deri 30,000 km</option>
            <option value="50000">deri 50,000 km</option>
            <option value="80000">deri 80,000 km</option>
            <option value="100000">deri 100,000 km</option>
            <option value="150000">deri 150,000 km</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className={selectClass}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active filters & clear */}
        {hasFilters && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-wrap gap-1.5">
              {manufacturer && (
                <FilterTag
                  label={MANUFACTURERS.find((m) => m.value === manufacturer)?.label || manufacturer}
                  onRemove={() => setManufacturer("")}
                />
              )}
              {model && (
                <FilterTag label={translateModel(model)} onRemove={() => setModel("")} />
              )}
              {badge && (
                <FilterTag
                  label={translateBadge(badge)}
                  onRemove={() => updateFilters({ badge: "" })}
                />
              )}
              {fuelType && (
                <FilterTag
                  label={translateFuel(fuelType)}
                  onRemove={() => updateFilters({ fuelType: "" })}
                />
              )}
              {minYear && (
                <FilterTag
                  label={`${minYear}+`}
                  onRemove={() => updateFilters({ minYear: "" })}
                />
              )}
              {maxMileage && (
                <FilterTag
                  label={`deri ${Number(maxMileage).toLocaleString()} km`}
                  onRemove={() => updateFilters({ maxMileage: "" })}
                />
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Pastro te gjitha
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-blue-900 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

const DEFAULT_FUELS = [
  { value: "가솔린", label: "Benzine" },
  { value: "디젤", label: "Diesel" },
  { value: "가솔린+전기", label: "Hybrid" },
  { value: "전기", label: "Elektrike" },
  { value: "LPG", label: "LPG" },
];

function translateFuel(f: string): string {
  const map: Record<string, string> = {
    "가솔린": "Benzine",
    "디젤": "Diesel",
    "가솔린+전기": "Hybrid",
    "전기": "Elektrike",
    "LPG": "LPG",
    "수소": "Hidrogjen",
    "가솔린+LPG": "Benzine+LPG",
  };
  return map[f] || f;
}
