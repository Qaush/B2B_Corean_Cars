"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MANUFACTURERS = [
  { group: "Koreane", items: ["Hyundai", "Kia", "Genesis", "KG Mobility", "Renault Korea (Samsung)"] },
  { group: "Premium", items: ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Volvo", "Land Rover", "Maserati"] },
  { group: "Europiane", items: ["Volkswagen", "Peugeot", "Renault", "Citroen", "MINI", "Skoda"] },
  { group: "Amerikane", items: ["Chevrolet (GM Daewoo)", "Ford", "Jeep", "Tesla", "Cadillac", "Lincoln"] },
  { group: "Japoneze", items: ["Toyota", "Honda", "Nissan", "Lexus", "Infiniti"] },
];

const PRICE_RANGES = [
  { label: "Deri 10,000€", value: "10000" },
  { label: "Deri 15,000€", value: "15000" },
  { label: "Deri 20,000€", value: "20000" },
  { label: "Deri 30,000€", value: "30000" },
  { label: "Deri 50,000€", value: "50000" },
  { label: "Pa limit", value: "" },
];

export default function HeroSearch() {
  const router = useRouter();
  const [manufacturer, setManufacturer] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (manufacturer) params.set("manufacturer", manufacturer);
    if (fuelType) params.set("fuelType", fuelType);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Brand */}
          <select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className="flex-1 bg-gray-50 rounded-xl px-4 py-3.5 text-sm text-gray-700 border-0 focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer"
          >
            <option value="">Te gjitha markat</option>
            {MANUFACTURERS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.items.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Fuel */}
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="flex-1 bg-gray-50 rounded-xl px-4 py-3.5 text-sm text-gray-700 border-0 focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer"
          >
            <option value="">Karburanti</option>
            <option value="Gasoline">Benzine</option>
            <option value="Diesel">Diesel</option>
            <option value="LPG">LPG</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Elektrik</option>
          </select>

          {/* Price */}
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="flex-1 bg-gray-50 rounded-xl px-4 py-3.5 text-sm text-gray-700 border-0 focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer"
          >
            <option value="">Cmimi</option>
            {PRICE_RANGES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {/* CTA */}
          <button
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Kerko
          </button>
        </div>
      </div>
    </div>
  );
}
