"use client";

import { useState } from "react";
import {
  formatEur,
  getTotalPrice,
  translateManufacturer,
  translateModel,
} from "@/lib/encar";

interface Reservation {
  id: string;
  carId: string;
  carData: any;
  status: string;
  notes: string | null;
  adminNotes: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null; image: string | null };
}

const statusOptions = [
  { value: "pending", label: "Ne pritje", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Konfirmuar", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Anulluar", color: "bg-red-100 text-red-800" },
];

const tabs = [
  { value: "", label: "Te gjitha" },
  { value: "pending", label: "Ne pritje" },
  { value: "confirmed", label: "Konfirmuar" },
  { value: "cancelled", label: "Anulluar" },
];

export default function ReservationsTable({ initialData }: { initialData: Reservation[] }) {
  const [data, setData] = useState(initialData);
  const [filter, setFilter] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const filtered = filter ? data.filter((r) => r.status === filter) : data;

  const updateStatus = async (id: string, status: string) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const saveNotes = async (id: string) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, adminNotes: noteValue } : r)));
    setEditingNotes(null);
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminNotes: noteValue }),
    });
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab.label}
            {tab.value === "" && ` (${data.length})`}
            {tab.value && ` (${data.filter((r) => r.status === tab.value).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">Nuk ka rezervime.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Vetura</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Klienti</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Statusi</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Shenimet</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Admin Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => {
                  const car = r.carData;
                  const { total } = getTotalPrice(car.price);
                  const st = statusOptions.find((s) => s.value === r.status) || statusOptions[0];

                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={car.image} alt="" className="w-14 h-10 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {translateManufacturer(car.manufacturer)} {translateModel(car.model)}
                            </p>
                            <p className="text-xs text-blue-600 font-semibold">{formatEur(total)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{r.user.name || "—"}</p>
                        <p className="text-xs text-gray-500">{r.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${st.color}`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("sq-AL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px]">
                        <p className="truncate">{r.notes || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        {editingNotes === r.id ? (
                          <div className="flex gap-1">
                            <input
                              value={noteValue}
                              onChange={(e) => setNoteValue(e.target.value)}
                              className="text-sm border border-gray-200 rounded px-2 py-1 w-40"
                              autoFocus
                            />
                            <button
                              onClick={() => saveNotes(r.id)}
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                            >
                              Ruaj
                            </button>
                            <button
                              onClick={() => setEditingNotes(null)}
                              className="text-xs text-gray-500 px-2 py-1"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNotes(r.id);
                              setNoteValue(r.adminNotes || "");
                            }}
                            className="text-sm text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            {r.adminNotes || "+ Shto note"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
