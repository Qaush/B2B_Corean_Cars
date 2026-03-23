"use client";

import { useState } from "react";

interface CarBodyDiagramProps {
  diagnosisItems?: any[];
  inspectionOuters?: any[];
}

const PANEL_POSITIONS: Record<string, string> = {
  HOOD: "hood", FRONT_FENDER_LEFT: "fender-fl", FRONT_FENDER_RIGHT: "fender-fr",
  FRONT_DOOR_LEFT: "door-fl", FRONT_DOOR_RIGHT: "door-fr",
  BACK_DOOR_LEFT: "door-rl", BACK_DOOR_RIGHT: "door-rr",
  TRUNK_LID: "trunk", ROOF_PANEL: "roof",
  QUARTER_PANEL_LEFT: "quarter-l", QUARTER_PANEL_RIGHT: "quarter-r",
  SIDE_SILL_LEFT: "sill-l", SIDE_SILL_RIGHT: "sill-r",
  FRONT_PANEL: "bumper-f", REAR_PANEL: "bumper-r",
  PILLAR_A_LEFT: "pillar-al", PILLAR_A_RIGHT: "pillar-ar",
  PILLAR_B_LEFT: "pillar-bl", PILLAR_B_RIGHT: "pillar-br",
  PILLAR_C_LEFT: "pillar-cl", PILLAR_C_RIGHT: "pillar-cr",
};

const PANEL_LABELS: Record<string, string> = {
  "hood": "Kapaku", "fender-fl": "Krahori i perp. majtas", "fender-fr": "Krahori i perp. djathtas",
  "door-fl": "Dera e perp. majtas", "door-fr": "Dera e perp. djathtas",
  "door-rl": "Dera e pasme majtas", "door-rr": "Dera e pasme djathtas",
  "trunk": "Kapaku i bagazhit", "roof": "Paneli i catise",
  "quarter-l": "Paneli i pasem majtas", "quarter-r": "Paneli i pasem djathtas",
  "sill-l": "Pragu majtas", "sill-r": "Pragu djathtas",
  "bumper-f": "Paneli i perp.", "bumper-r": "Paneli i pasem",
  "pillar-al": "Shtylla A majtas", "pillar-ar": "Shtylla A djathtas",
  "pillar-bl": "Shtylla B majtas", "pillar-br": "Shtylla B djathtas",
  "pillar-cl": "Shtylla C majtas", "pillar-cr": "Shtylla C djathtas",
};

const STATUS_MARKER: Record<string, { letter: string; bg: string; label: string }> = {
  REPLACEMENT: { letter: "X", bg: "#dc2626", label: "Nderruar" },
  SHEET_METAL: { letter: "W", bg: "#ea580c", label: "Llamarine/Saldim" },
  CORROSION: { letter: "C", bg: "#ca8a04", label: "Korrozion" },
  SCRATCH: { letter: "A", bg: "#2563eb", label: "Gervishje" },
  UNEVEN: { letter: "U", bg: "#7c3aed", label: "Siperfaqe e pabarabarte" },
  DAMAGE: { letter: "T", bg: "#dc2626", label: "Demtim" },
};

// Zone positions as percentages (top%, left%) relative to the container
const ZONES: Record<string, { top: string; left: string }> = {
  "bumper-f": { top: "7%", left: "47%" },
  "hood": { top: "17%", left: "47%" },
  "fender-fl": { top: "17%", left: "36%" },
  "fender-fr": { top: "17%", left: "58%" },
  "pillar-al": { top: "30%", left: "36%" },
  "pillar-ar": { top: "30%", left: "59%" },
  "door-fl": { top: "33%", left: "13%" },
  "door-fr": { top: "33%", left: "82%" },
  "roof": { top: "46%", left: "47%" },
  "sill-l": { top: "46%", left: "35%" },
  "sill-r": { top: "46%", left: "60%" },
  "pillar-bl": { top: "51%", left: "36%" },
  "pillar-br": { top: "51%", left: "59%" },
  "door-rl": { top: "62%", left: "13%" },
  "door-rr": { top: "62%", left: "82%" },
  "pillar-cl": { top: "69%", left: "36%" },
  "pillar-cr": { top: "69%", left: "59%" },
  "quarter-l": { top: "73%", left: "36%" },
  "quarter-r": { top: "73%", left: "59%" },
  "trunk": { top: "79%", left: "47%" },
  "bumper-r": { top: "88%", left: "47%" },
};

export default function CarBodyDiagram({ diagnosisItems }: CarBodyDiagramProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const panelStatus: Record<string, string> = {};
  if (diagnosisItems) {
    diagnosisItems.forEach((item: any) => {
      if (item.resultCode && item.name && PANEL_POSITIONS[item.name]) {
        panelStatus[PANEL_POSITIONS[item.name]] = item.resultCode;
      }
    });
  }

  const hasData = diagnosisItems && diagnosisItems.some(
    (item: any) => item.resultCode && PANEL_POSITIONS[item.name]
  );
  if (!hasData) return null;

  const hasDamage = Object.values(panelStatus).some(s => s !== "NORMAL");

  return (
    <div className="mb-5">
      <h3 className="font-semibold text-gray-900 mb-3">Diagrama e paneleve</h3>
      <div className="bg-white rounded-xl border border-gray-200 p-4">

        {/* Selected panel info */}
        {selected && panelStatus[selected] && panelStatus[selected] !== "NORMAL" && (
          <div className="mb-3 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: STATUS_MARKER[panelStatus[selected]]?.bg }}>
                {STATUS_MARKER[panelStatus[selected]]?.letter}
              </span>
              <span className="font-medium">{PANEL_LABELS[selected]}</span>
              <span>-</span>
              <span className="font-semibold">{STATUS_MARKER[panelStatus[selected]]?.label}</span>
            </span>
          </div>
        )}

        {/* Car diagram with overlay zones */}
        <div className="relative max-w-[460px] mx-auto">
          {/* Background car image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/car-diagram.svg" alt="Car diagram" className="w-full" />

          {/* Damage markers overlay */}
          {Object.entries(panelStatus).map(([id, status]) => {
            if (status === "NORMAL" || !ZONES[id]) return null;
            const marker = STATUS_MARKER[status];
            if (!marker) return null;
            const pos = ZONES[id];

            return (
              <button
                key={id}
                onClick={() => setSelected(selected === id ? null : id)}
                className={`absolute w-[20px] h-[20px] -ml-[10px] -mt-[10px] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md transition-transform hover:scale-125 ${selected === id ? "scale-125 ring-2 ring-white ring-offset-1" : ""}`}
                style={{
                  top: pos.top,
                  left: pos.left,
                  backgroundColor: marker.bg,
                }}
                title={`${PANEL_LABELS[id]} - ${marker.label}`}
              >
                {marker.letter}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-4 text-[11px] text-gray-700">
          {Object.entries(STATUS_MARKER).map(([, info]) => (
            <span key={info.letter} className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                style={{ backgroundColor: info.bg }}>{info.letter}</span>
              {info.label}
            </span>
          ))}
        </div>

        {/* Status message */}
        <p className={`text-center mt-3 text-xs font-medium ${hasDamage ? "text-red-600" : "text-green-600"}`}>
          {hasDamage
            ? "Ka ndryshime te konstatuara ne panele"
            : "Te gjitha panelet jane ne gjendje normale - Pa aksident"}
        </p>
      </div>
    </div>
  );
}
