"use client";

import { useState } from "react";

interface CarBodyDiagramProps {
  diagnosisItems?: any[];
  inspectionOuters?: any[];
}

const PANEL_POSITIONS: Record<string, string> = {
  HOOD: "hood",
  FRONT_FENDER_LEFT: "fender-fl",
  FRONT_FENDER_RIGHT: "fender-fr",
  FRONT_DOOR_LEFT: "door-fl",
  FRONT_DOOR_RIGHT: "door-fr",
  BACK_DOOR_LEFT: "door-rl",
  BACK_DOOR_RIGHT: "door-rr",
  TRUNK_LID: "trunk",
  ROOF_PANEL: "roof",
  QUARTER_PANEL_LEFT: "quarter-l",
  QUARTER_PANEL_RIGHT: "quarter-r",
  SIDE_SILL_LEFT: "sill-l",
  SIDE_SILL_RIGHT: "sill-r",
  FRONT_PANEL: "bumper-f",
  REAR_PANEL: "bumper-r",
  PILLAR_A_LEFT: "pillar-al",
  PILLAR_A_RIGHT: "pillar-ar",
  PILLAR_B_LEFT: "pillar-bl",
  PILLAR_B_RIGHT: "pillar-br",
  PILLAR_C_LEFT: "pillar-cl",
  PILLAR_C_RIGHT: "pillar-cr",
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

const STATUS_MARKER: Record<string, { letter: string; color: string; label: string }> = {
  REPLACEMENT: { letter: "X", color: "#dc2626", label: "Nderruar" },
  SHEET_METAL: { letter: "W", color: "#ea580c", label: "Llamarine/Saldim" },
  CORROSION: { letter: "C", color: "#ca8a04", label: "Korrozion" },
  SCRATCH: { letter: "A", color: "#2563eb", label: "Gervishje" },
  UNEVEN: { letter: "U", color: "#7c3aed", label: "Siperfaqe e pabarabarte" },
  DAMAGE: { letter: "T", color: "#dc2626", label: "Demtim" },
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

  const isNormal = (id: string) => !panelStatus[id] || panelStatus[id] === "NORMAL";
  const getStatus = (id: string) => panelStatus[id] || "NORMAL";

  // Marker positions for each panel (x, y in the SVG coordinate space)
  const markerPos: Record<string, [number, number]> = {
    "bumper-f": [250, 48], "hood": [250, 100], "fender-fl": [198, 100], "fender-fr": [302, 100],
    "pillar-al": [198, 155], "pillar-ar": [302, 155],
    "door-fl": [78, 155], "door-fr": [422, 155],
    "roof": [250, 225], "sill-l": [190, 225], "sill-r": [310, 225],
    "pillar-bl": [188, 240], "pillar-br": [312, 240],
    "door-rl": [78, 290], "door-rr": [422, 290],
    "pillar-cl": [198, 325], "pillar-cr": [302, 325],
    "quarter-l": [198, 345], "quarter-r": [302, 345],
    "trunk": [250, 370], "bumper-r": [250, 410],
  };

  const Marker = ({ id }: { id: string }) => {
    if (isNormal(id)) return null;
    const pos = markerPos[id];
    if (!pos) return null;
    const info = STATUS_MARKER[getStatus(id)];
    if (!info) return null;
    return (
      <g className="cursor-pointer" onClick={() => setSelected(id)}>
        <circle cx={pos[0]} cy={pos[1]} r="9" fill={info.color} />
        <text x={pos[0]} y={pos[1] + 1} textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="9" fontWeight="bold">{info.letter}</text>
      </g>
    );
  };

  const sel = selected && !isNormal(selected) ? {
    label: PANEL_LABELS[selected],
    ...STATUS_MARKER[getStatus(selected)],
  } : null;

  return (
    <div className="mb-5">
      <h3 className="font-semibold text-gray-900 mb-3">Diagrama e paneleve</h3>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {sel && (
          <div className="mb-3 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
              style={{ backgroundColor: sel.color + "15", color: sel.color, border: `1px solid ${sel.color}30` }}>
              <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: sel.color }}>{sel.letter}</span>
              <span className="font-medium">{sel.label}</span> - {sel.label}
            </span>
          </div>
        )}

        <div className="flex justify-center">
          <svg viewBox="0 0 500 460" className="w-full max-w-[460px]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f9fafb" />
                <stop offset="100%" stopColor="#f3f4f6" />
              </linearGradient>
              <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#c7d2fe" />
              </linearGradient>
            </defs>

            {/* ========= CENTER: CAR TOP VIEW ========= */}
            <g>
              {/* Car body outline - realistic sedan shape */}
              <path d="M210,30 Q215,18 250,15 Q285,18 290,30 L295,55 L300,75 L305,110
                L308,140 L310,175 L310,290 L308,330 L305,360 L300,390 L295,410
                Q290,435 250,440 Q210,435 205,410 L200,390 L195,360 L192,330
                L190,290 L190,175 L192,140 L195,110 L200,75 L205,55 Z"
                fill="url(#bodyGrad)" stroke="#9ca3af" strokeWidth="1.2" />

              {/* Front bumper */}
              <path d="M215,32 Q220,20 250,17 Q280,20 285,32 L288,48 L212,48 Z"
                fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.8"
                className="cursor-pointer hover:fill-gray-200" onClick={() => setSelected("bumper-f")} />

              {/* Headlights */}
              <ellipse cx="222" cy="35" rx="8" ry="6" fill="#fef3c7" stroke="#d1d5db" strokeWidth="0.5" />
              <ellipse cx="278" cy="35" rx="8" ry="6" fill="#fef3c7" stroke="#d1d5db" strokeWidth="0.5" />

              {/* Hood */}
              <path d="M212,48 L288,48 L295,75 L300,120 L200,120 L205,75 Z"
                fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.8"
                className="cursor-pointer hover:fill-gray-200" onClick={() => setSelected("hood")} />
              {/* Hood line */}
              <line x1="250" y1="52" x2="250" y2="115" stroke="#d1d5db" strokeWidth="0.4" />

              {/* Left front fender */}
              <path d="M195,50 L212,48 L205,75 L200,120 L190,120 L188,85 Z"
                fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.8"
                className="cursor-pointer hover:fill-gray-200" onClick={() => setSelected("fender-fl")} />

              {/* Right front fender */}
              <path d="M288,48 L305,50 L312,85 L310,120 L300,120 L295,75 Z"
                fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.8"
                className="cursor-pointer hover:fill-gray-200" onClick={() => setSelected("fender-fr")} />

              {/* Front windshield */}
              <path d="M200,120 L300,120 L305,165 L195,165 Z"
                fill="url(#glassGrad)" opacity="0.5" stroke="#93c5fd" strokeWidth="0.6" />

              {/* A-pillars */}
              <rect x="188" y="120" width="7" height="45" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.6"
                className="cursor-pointer hover:fill-gray-300" onClick={() => setSelected("pillar-al")} />
              <rect x="305" y="120" width="7" height="45" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.6"
                className="cursor-pointer hover:fill-gray-300" onClick={() => setSelected("pillar-ar")} />

              {/* Roof */}
              <path d="M195,165 L305,165 L305,310 L195,310 Z"
                fill="#eff1f3" stroke="#9ca3af" strokeWidth="0.8"
                className="cursor-pointer hover:fill-gray-200" onClick={() => setSelected("roof")} />
              {/* Sunroof hint */}
              <rect x="220" y="195" width="60" height="80" rx="5" fill="none" stroke="#d1d5db" strokeWidth="0.4" strokeDasharray="3,3" />

              {/* Left sill */}
              <rect x="184" y="165" width="4" height="160" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.4"
                className="cursor-pointer hover:fill-gray-300" onClick={() => setSelected("sill-l")} />
              {/* Right sill */}
              <rect x="312" y="165" width="4" height="160" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.4"
                className="cursor-pointer hover:fill-gray-300" onClick={() => setSelected("sill-r")} />

              {/* B-pillars */}
              <rect x="188" y="235" width="7" height="22" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.6"
                className="cursor-pointer hover:fill-gray-400" onClick={() => setSelected("pillar-bl")} />
              <rect x="305" y="235" width="7" height="22" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.6"
                className="cursor-pointer hover:fill-gray-400" onClick={() => setSelected("pillar-br")} />

              {/* C-pillars */}
              <rect x="188" y="310" width="7" height="25" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.6"
                className="cursor-pointer hover:fill-gray-400" onClick={() => setSelected("pillar-cl")} />
              <rect x="305" y="310" width="7" height="25" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.6"
                className="cursor-pointer hover:fill-gray-400" onClick={() => setSelected("pillar-cr")} />

              {/* Quarter panels */}
              <path d="M188,335 L195,310 L195,365 L192,365 Z"
                fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.6"
                className="cursor-pointer hover:fill-gray-200" onClick={() => setSelected("quarter-l")} />
              <path d="M305,310 L312,335 L308,365 L305,365 Z"
                fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.6"
                className="cursor-pointer hover:fill-gray-200" onClick={() => setSelected("quarter-r")} />

              {/* Rear windshield */}
              <path d="M195,310 L305,310 L300,348 L200,348 Z"
                fill="url(#glassGrad)" opacity="0.5" stroke="#93c5fd" strokeWidth="0.6" />

              {/* Trunk */}
              <path d="M200,348 L300,348 L295,395 L205,395 Z"
                fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.8"
                className="cursor-pointer hover:fill-gray-200" onClick={() => setSelected("trunk")} />
              {/* Trunk line */}
              <line x1="250" y1="352" x2="250" y2="390" stroke="#d1d5db" strokeWidth="0.4" />

              {/* Rear bumper */}
              <path d="M205,395 L295,395 Q290,425 250,430 Q210,425 205,395 Z"
                fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.8"
                className="cursor-pointer hover:fill-gray-200" onClick={() => setSelected("bumper-r")} />

              {/* Taillights */}
              <ellipse cx="215" cy="400" rx="8" ry="5" fill="#fecaca" stroke="#d1d5db" strokeWidth="0.5" />
              <ellipse cx="285" cy="400" rx="8" ry="5" fill="#fecaca" stroke="#d1d5db" strokeWidth="0.5" />

              {/* Wheels */}
              <ellipse cx="180" cy="95" rx="12" ry="22" fill="#374151" opacity="0.5" />
              <ellipse cx="180" cy="95" rx="6" ry="12" fill="#6b7280" opacity="0.3" />
              <ellipse cx="320" cy="95" rx="12" ry="22" fill="#374151" opacity="0.5" />
              <ellipse cx="320" cy="95" rx="6" ry="12" fill="#6b7280" opacity="0.3" />
              <ellipse cx="180" cy="355" rx="12" ry="22" fill="#374151" opacity="0.5" />
              <ellipse cx="180" cy="355" rx="6" ry="12" fill="#6b7280" opacity="0.3" />
              <ellipse cx="320" cy="355" rx="12" ry="22" fill="#374151" opacity="0.5" />
              <ellipse cx="320" cy="355" rx="6" ry="12" fill="#6b7280" opacity="0.3" />

              {/* Side mirrors */}
              <ellipse cx="178" cy="140" rx="8" ry="5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
              <ellipse cx="322" cy="140" rx="8" ry="5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            </g>

            {/* ========= LEFT DOORS (opened) ========= */}
            <g>
              {/* Hinge lines */}
              <line x1="130" y1="160" x2="184" y2="168" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="130" y1="260" x2="184" y2="258" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Front door left */}
              <path d="M35,115 L130,130 L130,230 L35,245 Z"
                fill="#f9fafb" stroke="#9ca3af" strokeWidth="1"
                className="cursor-pointer hover:fill-gray-100" onClick={() => setSelected("door-fl")} />
              {/* Door window */}
              <path d="M45,125 L122,138 L122,178 L45,168 Z"
                fill="url(#glassGrad)" opacity="0.4" stroke="#93c5fd" strokeWidth="0.5" />
              {/* Door handle */}
              <rect x="60" y="195" width="18" height="3" rx="1.5" fill="#9ca3af" />
              {/* Door edge line */}
              <line x1="38" y1="180" x2="128" y2="184" stroke="#d1d5db" strokeWidth="0.4" />

              {/* Rear door left */}
              <path d="M35,255 L130,240 L130,340 L35,355 Z"
                fill="#f9fafb" stroke="#9ca3af" strokeWidth="1"
                className="cursor-pointer hover:fill-gray-100" onClick={() => setSelected("door-rl")} />
              {/* Door window */}
              <path d="M45,263 L122,250 L122,290 L45,300 Z"
                fill="url(#glassGrad)" opacity="0.4" stroke="#93c5fd" strokeWidth="0.5" />
              {/* Door handle */}
              <rect x="60" y="310" width="18" height="3" rx="1.5" fill="#9ca3af" />
              {/* Door edge line */}
              <line x1="38" y1="308" x2="128" y2="298" stroke="#d1d5db" strokeWidth="0.4" />
            </g>

            {/* ========= RIGHT DOORS (opened) ========= */}
            <g>
              {/* Hinge lines */}
              <line x1="370" y1="160" x2="316" y2="168" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="370" y1="260" x2="316" y2="258" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Front door right */}
              <path d="M465,115 L370,130 L370,230 L465,245 Z"
                fill="#f9fafb" stroke="#9ca3af" strokeWidth="1"
                className="cursor-pointer hover:fill-gray-100" onClick={() => setSelected("door-fr")} />
              {/* Door window */}
              <path d="M455,125 L378,138 L378,178 L455,168 Z"
                fill="url(#glassGrad)" opacity="0.4" stroke="#93c5fd" strokeWidth="0.5" />
              {/* Door handle */}
              <rect x="420" y="195" width="18" height="3" rx="1.5" fill="#9ca3af" />
              <line x1="462" y1="180" x2="372" y2="184" stroke="#d1d5db" strokeWidth="0.4" />

              {/* Rear door right */}
              <path d="M465,255 L370,240 L370,340 L465,355 Z"
                fill="#f9fafb" stroke="#9ca3af" strokeWidth="1"
                className="cursor-pointer hover:fill-gray-100" onClick={() => setSelected("door-rr")} />
              {/* Door window */}
              <path d="M455,263 L378,250 L378,290 L455,300 Z"
                fill="url(#glassGrad)" opacity="0.4" stroke="#93c5fd" strokeWidth="0.5" />
              {/* Door handle */}
              <rect x="420" y="310" width="18" height="3" rx="1.5" fill="#9ca3af" />
              <line x1="462" y1="308" x2="372" y2="298" stroke="#d1d5db" strokeWidth="0.4" />
            </g>

            {/* ========= DAMAGE MARKERS ========= */}
            {Object.keys(panelStatus).map(id => (
              <Marker key={id} id={id} />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-4 text-[11px] text-gray-700">
          {Object.entries(STATUS_MARKER).map(([code, info]) => (
            <span key={code} className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                style={{ backgroundColor: info.color }}>{info.letter}</span>
              {info.label}
            </span>
          ))}
        </div>

        {/* Status */}
        <div className="text-center mt-3">
          {Object.values(panelStatus).some(s => s !== "NORMAL") ? (
            <span className="text-xs text-red-600 font-medium">
              Ka ndryshime te konstatuara ne panele
            </span>
          ) : (
            <span className="text-xs text-green-600 font-medium">
              Te gjitha panelet jane ne gjendje normale
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
