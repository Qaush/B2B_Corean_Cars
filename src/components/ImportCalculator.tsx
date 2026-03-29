"use client";

import { useState } from "react";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function ImportCalculator() {
  const { whatsappNumber } = useSiteSettings();
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [cc, setCc] = useState("");

  const priceNum = parseFloat(price) || 0;
  const yearNum = parseInt(year) || new Date().getFullYear();
  const ccNum = parseInt(cc) || 0;

  const carAge = new Date().getFullYear() - yearNum;
  const transport = 1500;
  const customs = priceNum > 0 ? Math.round(priceNum * (ccNum > 2000 ? 0.15 : 0.10)) : 0;
  const vat = Math.round((priceNum + customs + transport) * 0.18);
  const registration = carAge > 5 ? 150 : carAge > 3 ? 100 : 50;
  const total = priceNum + transport + customs + vat + registration;

  const hasInput = priceNum > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cmimi i vetures (EUR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="p.sh. 15000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Viti i prodhimit</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Zgjidh vitin</option>
              {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motorri (cc)</label>
            <select
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Zgjidh</option>
              <option value="1000">Deri 1.0L</option>
              <option value="1400">1.0 - 1.4L</option>
              <option value="1600">1.4 - 1.6L</option>
              <option value="2000">1.6 - 2.0L</option>
              <option value="2500">2.0 - 2.5L</option>
              <option value="3000">2.5 - 3.0L</option>
              <option value="4000">3.0L+</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {hasInput && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Zberthimi i kostos</h3>
            <div className="space-y-3">
              <Row label="Cmimi i vetures" value={priceNum} />
              <Row label="Transporti (Korea → Kosove)" value={transport} />
              <Row label={`Dogana (${ccNum > 2000 ? "15%" : "10%"})`} value={customs} />
              <Row label="TVSH (18%)" value={vat} />
              <Row label="Regjistrimi" value={registration} />
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg">Totali i vleresuar</span>
                <span className="font-bold text-red-600 text-2xl">
                  {new Intl.NumberFormat("de-DE").format(total)} €
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              * Ky eshte nje vleresim orientues. Kostot e sakta mund te ndryshojne.
            </p>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Pershendetje! Dua te importoj nje veture me cmim ${price}€, viti ${year}. A mund te me jepni nje oferte te sakte?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Kontaktoni per oferte te sakte
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{new Intl.NumberFormat("de-DE").format(value)} €</span>
    </div>
  );
}
