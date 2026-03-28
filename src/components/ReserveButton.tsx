"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ReserveButtonProps {
  carId: string;
  carData: Record<string, unknown>;
}

export default function ReserveButton({ carId, carData }: ReserveButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleClick = () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId, carData, notes: notes.trim() || undefined }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          setShowModal(false);
          setStatus("idle");
          setNotes("");
        }, 2000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Dicka shkoi keq");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Dicka shkoi keq. Provoni perseri.");
      setStatus("error");
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Rezervo Kete Veture
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            {status === "success" ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Rezervimi u krye!</h3>
                <p className="text-gray-500 mt-1">Do t&apos;ju kontaktojmë së shpejti.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Rezervo Veturen</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Plotesoni formën dhe do t&apos;ju kontaktojme per detaje.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shënime (opsionale)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="P.sh. dua ta shikoj ne vend, jam i interesuar per financim..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-600 mb-3">{errorMsg}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setStatus("idle");
                      setErrorMsg("");
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Anulo
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={status === "loading"}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    {status === "loading" ? "Duke derguar..." : "Konfirmo Rezervimin"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
