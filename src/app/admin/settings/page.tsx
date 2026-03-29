"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setWhatsappNumber(data.whatsappNumber || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "whatsappNumber", value: whatsappNumber }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const formatDisplay = (num: string) => {
    if (num.startsWith("383")) {
      return `+${num.slice(0, 3)} ${num.slice(3, 5)} ${num.slice(5, 8)} ${num.slice(8)}`;
    }
    return `+${num}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cilesimet</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* WhatsApp Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Numri i WhatsApp
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Ky numer shfaqet ne te gjitha butonat &quot;Na Kontakto&quot;, &quot;Porosit permes WhatsApp&quot;, dhe ne chatbot.
            Vendos numrin pa &quot;+&quot; (p.sh. 38344647559).
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="38344647559"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              onClick={handleSave}
              disabled={saving || !whatsappNumber}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? "Duke ruajtur..." : "Ruaj"}
            </button>
          </div>
          {whatsappNumber && (
            <p className="text-xs text-gray-400 mt-2">
              Do te shfaqet si: <span className="font-medium text-gray-600">{formatDisplay(whatsappNumber)}</span>
            </p>
          )}
          {saved && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              Numri u ruajt me sukses!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
