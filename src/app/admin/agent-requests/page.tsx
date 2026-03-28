"use client";

import { useEffect, useState } from "react";

interface AgentRequest {
  id: string;
  phoneNumber: string;
  lastMessage: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const statusOptions = [
  { value: "pending", label: "Ne pritje", color: "bg-yellow-100 text-yellow-800" },
  { value: "contacted", label: "Kontaktuar", color: "bg-blue-100 text-blue-800" },
  { value: "resolved", label: "Zgjidhur", color: "bg-green-100 text-green-800" },
];

export default function AgentRequestsPage() {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/agent-requests")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRequests(data); })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch("/api/admin/agent-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kerkesat per Agjent</h1>
        {pendingCount > 0 && (
          <span className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
            {pendingCount} ne pritje
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">Duke ngarkuar...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">
          <p className="mb-2">Nuk ka kerkesa per agjent.</p>
          <p className="text-sm text-gray-400">Kur AI nuk mund ta trajtoje nje bisede WhatsApp, kerkesa shfaqet ketu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const st = statusOptions.find((s) => s.value === r.status) || statusOptions[0];
            return (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-medium text-gray-900">{r.phoneNumber}</span>
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${st.color}`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{r.lastMessage}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("sq-AL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${r.phoneNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    Kontakto
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
