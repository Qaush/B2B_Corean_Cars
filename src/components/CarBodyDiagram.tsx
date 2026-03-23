"use client";

import { useState } from "react";

interface CarBodyDiagramProps {
  diagnosisItems?: any[];
  inspectionOuters?: any[];
}

const PANEL_POSITIONS: Record<string, string> = {
  HOOD: "hood",
  FRONT_FENDER_LEFT: "front-fender-left",
  FRONT_FENDER_RIGHT: "front-fender-right",
  FRONT_DOOR_LEFT: "front-door-left",
  FRONT_DOOR_RIGHT: "front-door-right",
  BACK_DOOR_LEFT: "back-door-left",
  BACK_DOOR_RIGHT: "back-door-right",
  TRUNK_LID: "trunk",
  ROOF_PANEL: "roof",
  QUARTER_PANEL_LEFT: "quarter-left",
  QUARTER_PANEL_RIGHT: "quarter-right",
  SIDE_SILL_LEFT: "sill-left",
  SIDE_SILL_RIGHT: "sill-right",
  FRONT_PANEL: "front-panel",
  REAR_PANEL: "rear-panel",
  PILLAR_A_LEFT: "pillar-a-left",
  PILLAR_A_RIGHT: "pillar-a-right",
  PILLAR_B_LEFT: "pillar-b-left",
  PILLAR_B_RIGHT: "pillar-b-right",
  PILLAR_C_LEFT: "pillar-c-left",
  PILLAR_C_RIGHT: "pillar-c-right",
};

const PANEL_LABELS: Record<string, string> = {
  "hood": "Kapaku",
  "front-fender-left": "Krahori i perp. majtas",
  "front-fender-right": "Krahori i perp. djathtas",
  "front-door-left": "Dera e perp. majtas",
  "front-door-right": "Dera e perp. djathtas",
  "back-door-left": "Dera e pasme majtas",
  "back-door-right": "Dera e pasme djathtas",
  "trunk": "Kapaku i bagazhit",
  "roof": "Paneli i catise",
  "quarter-left": "Paneli i pasem majtas",
  "quarter-right": "Paneli i pasem djathtas",
  "sill-left": "Pragu majtas",
  "sill-right": "Pragu djathtas",
  "front-panel": "Paneli i perp.",
  "rear-panel": "Paneli i pasem",
  "pillar-a-left": "Shtylla A majtas",
  "pillar-a-right": "Shtylla A djathtas",
  "pillar-b-left": "Shtylla B majtas",
  "pillar-b-right": "Shtylla B djathtas",
  "pillar-c-left": "Shtylla C majtas",
  "pillar-c-right": "Shtylla C djathtas",
};

const STATUS_INFO: Record<string, { label: string; color: string; bgColor: string }> = {
  NORMAL: { label: "Normal", color: "#16a34a", bgColor: "#dcfce7" },
  REPLACEMENT: { label: "Nderruar", color: "#dc2626", bgColor: "#fee2e2" },
  SHEET_METAL: { label: "Llamarine", color: "#ea580c", bgColor: "#ffedd5" },
  CORROSION: { label: "Korrozion", color: "#ca8a04", bgColor: "#fef9c3" },
  SCRATCH: { label: "Gervishje", color: "#2563eb", bgColor: "#dbeafe" },
  UNEVEN: { label: "E pabarabarte", color: "#9333ea", bgColor: "#f3e8ff" },
  DAMAGE: { label: "Demtim", color: "#dc2626", bgColor: "#fee2e2" },
};

export default function CarBodyDiagram({ diagnosisItems, inspectionOuters }: CarBodyDiagramProps) {
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);

  // Build panel status map
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

  const hasIssues = Object.values(panelStatus).some(p => p !== "NORMAL");

  const isNormal = (id: string) => !panelStatus[id] || panelStatus[id] === "NORMAL";
  const getStatus = (id: string) => panelStatus[id] || "NORMAL";

  // Panel fill: light gray for normal, light red tint for damaged
  const panelFill = (id: string) => {
    if (selectedPanel === id) return "#e0e7ff";
    if (!panelStatus[id] || panelStatus[id] === "NORMAL") return "#f3f4f6";
    return "#fef2f2";
  };

  const panelStroke = (id: string) => {
    if (selectedPanel === id) return "#4f46e5";
    if (!panelStatus[id] || panelStatus[id] === "NORMAL") return "#d1d5db";
    return "#fca5a5";
  };

  const panelStrokeWidth = (id: string) => selectedPanel === id ? "1.5" : "0.8";

  // Render damage marker (red circle with X)
  const DamageMarker = ({ x, y, panelId }: { x: number; y: number; panelId: string }) => {
    if (isNormal(panelId)) return null;
    const status = STATUS_INFO[getStatus(panelId)];
    return (
      <g>
        <circle cx={x} cy={y} r="7" fill={status?.color || "#dc2626"} opacity="0.9" />
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="7" fontWeight="bold">
          {getStatus(panelId) === "REPLACEMENT" ? "X" :
           getStatus(panelId) === "SHEET_METAL" ? "W" :
           getStatus(panelId) === "CORROSION" ? "C" :
           getStatus(panelId) === "SCRATCH" ? "A" :
           getStatus(panelId) === "UNEVEN" ? "U" : "!"}
        </text>
      </g>
    );
  };

  const handleClick = (id: string) => {
    setSelectedPanel(selectedPanel === id ? null : id);
  };

  const selectedInfo = selectedPanel ? {
    label: PANEL_LABELS[selectedPanel] || selectedPanel,
    status: STATUS_INFO[getStatus(selectedPanel)] || STATUS_INFO.NORMAL,
    code: getStatus(selectedPanel),
  } : null;

  return (
    <div className="mb-5">
      <h3 className="font-semibold text-gray-900 mb-3">Diagrama e paneleve</h3>
      <div className="bg-white rounded-xl border border-gray-200 p-4">

        {/* Selected panel info */}
        {selectedInfo && (
          <div className="mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: selectedInfo.status.bgColor }}>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedInfo.status.color }}></span>
            <span className="font-medium">{selectedInfo.label}</span>
            <span className="text-gray-400">-</span>
            <span style={{ color: selectedInfo.status.color }} className="font-semibold">{selectedInfo.status.label}</span>
          </div>
        )}
        {!selectedPanel && (
          <div className="mb-3 text-center text-xs text-gray-400">Prekni nje panel per detaje</div>
        )}

        <div className="flex justify-center">
          <svg viewBox="0 0 500 400" className="w-full max-w-[500px]" xmlns="http://www.w3.org/2000/svg">

            {/* ===== LEFT SIDE VIEW (doors opened) ===== */}
            <g transform="translate(30, 50)">
              {/* Left front door - opened outward */}
              <path
                d="M0,60 L55,50 L55,155 L0,165 Z"
                fill={panelFill("front-door-left")}
                stroke={panelStroke("front-door-left")}
                strokeWidth={panelStrokeWidth("front-door-left")}
                className="cursor-pointer"
                onClick={() => handleClick("front-door-left")}
              />
              {/* Window on door */}
              <path d="M8,68 L50,60 L50,100 L8,106 Z" fill="#bfdbfe" opacity="0.4" stroke="#93c5fd" strokeWidth="0.5" />
              {/* Door handle */}
              <rect x="20" y="120" width="15" height="3" rx="1" fill="#9ca3af" />
              <DamageMarker x={28} y={140} panelId="front-door-left" />

              {/* Left rear door - opened outward */}
              <path
                d="M0,175 L55,165 L55,270 L0,280 Z"
                fill={panelFill("back-door-left")}
                stroke={panelStroke("back-door-left")}
                strokeWidth={panelStrokeWidth("back-door-left")}
                className="cursor-pointer"
                onClick={() => handleClick("back-door-left")}
              />
              {/* Window on door */}
              <path d="M8,183 L50,175 L50,215 L8,221 Z" fill="#bfdbfe" opacity="0.4" stroke="#93c5fd" strokeWidth="0.5" />
              {/* Door handle */}
              <rect x="20" y="235" width="15" height="3" rx="1" fill="#9ca3af" />
              <DamageMarker x={28} y={250} panelId="back-door-left" />

              {/* "MAJTAS" label */}
              <text x="28" y="15" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="500">MAJTAS</text>
            </g>

            {/* ===== CAR BODY (center top view) ===== */}
            <g transform="translate(140, 20)">
              {/* Car body shadow */}
              <path
                d="M50,8 Q55,0 110,0 Q165,0 170,8 L178,45 L182,90 L184,160 L184,200 L182,270 L178,315 L170,352 Q165,360 110,360 Q55,360 50,352 L42,315 L38,270 L36,200 L36,160 L38,90 L42,45 Z"
                fill="none" stroke="#e5e7eb" strokeWidth="1"
              />

              {/* Front bumper / panel */}
              <path
                d="M55,15 Q60,2 110,0 Q160,2 165,15 L168,35 L52,35 Z"
                fill={panelFill("front-panel")}
                stroke={panelStroke("front-panel")}
                strokeWidth={panelStrokeWidth("front-panel")}
                className="cursor-pointer"
                onClick={() => handleClick("front-panel")}
              />
              <DamageMarker x={110} y={18} panelId="front-panel" />

              {/* Hood */}
              <path
                d="M52,35 L168,35 L172,90 L48,90 Z"
                fill={panelFill("hood")}
                stroke={panelStroke("hood")}
                strokeWidth={panelStrokeWidth("hood")}
                className="cursor-pointer"
                onClick={() => handleClick("hood")}
              />
              <DamageMarker x={110} y={62} panelId="hood" />

              {/* Left front fender */}
              <path
                d="M38,35 L52,35 L48,90 L36,90 Z"
                fill={panelFill("front-fender-left")}
                stroke={panelStroke("front-fender-left")}
                strokeWidth={panelStrokeWidth("front-fender-left")}
                className="cursor-pointer"
                onClick={() => handleClick("front-fender-left")}
              />
              <DamageMarker x={43} y={62} panelId="front-fender-left" />

              {/* Right front fender */}
              <path
                d="M168,35 L182,35 L184,90 L172,90 Z"
                fill={panelFill("front-fender-right")}
                stroke={panelStroke("front-fender-right")}
                strokeWidth={panelStrokeWidth("front-fender-right")}
                className="cursor-pointer"
                onClick={() => handleClick("front-fender-right")}
              />
              <DamageMarker x={177} y={62} panelId="front-fender-right" />

              {/* Front windshield */}
              <path d="M48,90 L172,90 L176,125 L44,125 Z"
                fill="#bfdbfe" opacity="0.5" stroke="#93c5fd" strokeWidth="0.5" />

              {/* Pillar A Left */}
              <rect x="36" y="90" width="8" height="35"
                fill={panelFill("pillar-a-left")}
                stroke={panelStroke("pillar-a-left")}
                strokeWidth={panelStrokeWidth("pillar-a-left")}
                className="cursor-pointer"
                onClick={() => handleClick("pillar-a-left")}
              />
              <DamageMarker x={40} y={107} panelId="pillar-a-left" />

              {/* Pillar A Right */}
              <rect x="176" y="90" width="8" height="35"
                fill={panelFill("pillar-a-right")}
                stroke={panelStroke("pillar-a-right")}
                strokeWidth={panelStrokeWidth("pillar-a-right")}
                className="cursor-pointer"
                onClick={() => handleClick("pillar-a-right")}
              />
              <DamageMarker x={180} y={107} panelId="pillar-a-right" />

              {/* Roof */}
              <path
                d="M44,125 L176,125 L176,250 L44,250 Z"
                fill={panelFill("roof")}
                stroke={panelStroke("roof")}
                strokeWidth={panelStrokeWidth("roof")}
                className="cursor-pointer"
                onClick={() => handleClick("roof")}
              />
              <DamageMarker x={110} y={187} panelId="roof" />

              {/* Left sill */}
              <rect x="32" y="125" width="4" height="140"
                fill={panelFill("sill-left")}
                stroke={panelStroke("sill-left")}
                strokeWidth="0.5"
                className="cursor-pointer"
                onClick={() => handleClick("sill-left")}
              />

              {/* Right sill */}
              <rect x="184" y="125" width="4" height="140"
                fill={panelFill("sill-right")}
                stroke={panelStroke("sill-right")}
                strokeWidth="0.5"
                className="cursor-pointer"
                onClick={() => handleClick("sill-right")}
              />

              {/* Pillar B Left */}
              <rect x="36" y="185" width="8" height="20"
                fill={panelFill("pillar-b-left")}
                stroke={panelStroke("pillar-b-left")}
                strokeWidth={panelStrokeWidth("pillar-b-left")}
                className="cursor-pointer"
                onClick={() => handleClick("pillar-b-left")}
              />
              <DamageMarker x={40} y={195} panelId="pillar-b-left" />

              {/* Pillar B Right */}
              <rect x="176" y="185" width="8" height="20"
                fill={panelFill("pillar-b-right")}
                stroke={panelStroke("pillar-b-right")}
                strokeWidth={panelStrokeWidth("pillar-b-right")}
                className="cursor-pointer"
                onClick={() => handleClick("pillar-b-right")}
              />
              <DamageMarker x={180} y={195} panelId="pillar-b-right" />

              {/* Pillar C Left */}
              <rect x="36" y="250" width="8" height="20"
                fill={panelFill("pillar-c-left")}
                stroke={panelStroke("pillar-c-left")}
                strokeWidth={panelStrokeWidth("pillar-c-left")}
                className="cursor-pointer"
                onClick={() => handleClick("pillar-c-left")}
              />
              <DamageMarker x={40} y={260} panelId="pillar-c-left" />

              {/* Pillar C Right */}
              <rect x="176" y="250" width="8" height="20"
                fill={panelFill("pillar-c-right")}
                stroke={panelStroke("pillar-c-right")}
                strokeWidth={panelStrokeWidth("pillar-c-right")}
                className="cursor-pointer"
                onClick={() => handleClick("pillar-c-right")}
              />
              <DamageMarker x={180} y={260} panelId="pillar-c-right" />

              {/* Quarter panel left */}
              <path
                d="M36,270 L44,250 L44,300 L38,300 Z"
                fill={panelFill("quarter-left")}
                stroke={panelStroke("quarter-left")}
                strokeWidth={panelStrokeWidth("quarter-left")}
                className="cursor-pointer"
                onClick={() => handleClick("quarter-left")}
              />
              <DamageMarker x={40} y={280} panelId="quarter-left" />

              {/* Quarter panel right */}
              <path
                d="M176,250 L184,270 L182,300 L176,300 Z"
                fill={panelFill("quarter-right")}
                stroke={panelStroke("quarter-right")}
                strokeWidth={panelStrokeWidth("quarter-right")}
                className="cursor-pointer"
                onClick={() => handleClick("quarter-right")}
              />
              <DamageMarker x={180} y={280} panelId="quarter-right" />

              {/* Rear windshield */}
              <path d="M44,250 L176,250 L172,280 L48,280 Z"
                fill="#bfdbfe" opacity="0.5" stroke="#93c5fd" strokeWidth="0.5" />

              {/* Trunk */}
              <path
                d="M48,280 L172,280 L168,325 L52,325 Z"
                fill={panelFill("trunk")}
                stroke={panelStroke("trunk")}
                strokeWidth={panelStrokeWidth("trunk")}
                className="cursor-pointer"
                onClick={() => handleClick("trunk")}
              />
              <DamageMarker x={110} y={302} panelId="trunk" />

              {/* Rear panel */}
              <path
                d="M52,325 L168,325 Q165,345 110,348 Q55,345 52,325 Z"
                fill={panelFill("rear-panel")}
                stroke={panelStroke("rear-panel")}
                strokeWidth={panelStrokeWidth("rear-panel")}
                className="cursor-pointer"
                onClick={() => handleClick("rear-panel")}
              />
              <DamageMarker x={110} y={335} panelId="rear-panel" />

              {/* Wheels */}
              <ellipse cx="28" cy="72" rx="10" ry="18" fill="#374151" opacity="0.6" />
              <ellipse cx="192" cy="72" rx="10" ry="18" fill="#374151" opacity="0.6" />
              <ellipse cx="28" cy="290" rx="10" ry="18" fill="#374151" opacity="0.6" />
              <ellipse cx="192" cy="290" rx="10" ry="18" fill="#374151" opacity="0.6" />
              {/* Wheel rims */}
              <ellipse cx="28" cy="72" rx="5" ry="10" fill="#6b7280" opacity="0.4" />
              <ellipse cx="192" cy="72" rx="5" ry="10" fill="#6b7280" opacity="0.4" />
              <ellipse cx="28" cy="290" rx="5" ry="10" fill="#6b7280" opacity="0.4" />
              <ellipse cx="192" cy="290" rx="5" ry="10" fill="#6b7280" opacity="0.4" />

              {/* Headlights */}
              <ellipse cx="65" cy="12" rx="10" ry="5" fill="#fbbf24" opacity="0.4" />
              <ellipse cx="155" cy="12" rx="10" ry="5" fill="#fbbf24" opacity="0.4" />

              {/* Taillights */}
              <ellipse cx="65" cy="340" rx="10" ry="5" fill="#ef4444" opacity="0.4" />
              <ellipse cx="155" cy="340" rx="10" ry="5" fill="#ef4444" opacity="0.4" />

              {/* Side mirrors */}
              <ellipse cx="25" cy="108" rx="7" ry="5" fill="#d1d5db" opacity="0.6" />
              <ellipse cx="195" cy="108" rx="7" ry="5" fill="#d1d5db" opacity="0.6" />
            </g>

            {/* ===== RIGHT SIDE VIEW (doors opened) ===== */}
            <g transform="translate(415, 50)">
              {/* Right front door - opened outward */}
              <path
                d="M55,60 L0,50 L0,155 L55,165 Z"
                fill={panelFill("front-door-right")}
                stroke={panelStroke("front-door-right")}
                strokeWidth={panelStrokeWidth("front-door-right")}
                className="cursor-pointer"
                onClick={() => handleClick("front-door-right")}
              />
              {/* Window */}
              <path d="M47,68 L5,60 L5,100 L47,106 Z" fill="#bfdbfe" opacity="0.4" stroke="#93c5fd" strokeWidth="0.5" />
              {/* Handle */}
              <rect x="20" y="120" width="15" height="3" rx="1" fill="#9ca3af" />
              <DamageMarker x={28} y={140} panelId="front-door-right" />

              {/* Right rear door - opened outward */}
              <path
                d="M55,175 L0,165 L0,270 L55,280 Z"
                fill={panelFill("back-door-right")}
                stroke={panelStroke("back-door-right")}
                strokeWidth={panelStrokeWidth("back-door-right")}
                className="cursor-pointer"
                onClick={() => handleClick("back-door-right")}
              />
              {/* Window */}
              <path d="M47,183 L5,175 L5,215 L47,221 Z" fill="#bfdbfe" opacity="0.4" stroke="#93c5fd" strokeWidth="0.5" />
              {/* Handle */}
              <rect x="20" y="235" width="15" height="3" rx="1" fill="#9ca3af" />
              <DamageMarker x={28} y={250} panelId="back-door-right" />

              {/* "DJATHTAS" label */}
              <text x="28" y="15" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="500">DJATHTAS</text>
            </g>

            {/* Direction labels */}
            <text x="250" y="15" textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="600">PARA</text>
            <text x="250" y="395" textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="600">PRAPA</text>

            {/* Hinge lines connecting doors to body */}
            <line x1="85" y1="100" x2="172" y2="145" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="85" y1="225" x2="172" y2="205" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="415" y1="100" x2="328" y2="145" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="415" y1="225" x2="328" y2="205" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="3,3" />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 text-[11px] text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-gray-300"></span>
            Normal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <b>X</b> Nderruar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <b>W</b> Llamarine
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <b>C</b> Korrozion
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <b>A</b> Gervishje
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <b>U</b> E pabarabarte
          </span>
        </div>

        {/* Summary badge */}
        <div className="flex justify-center mt-3">
          {hasIssues ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Ka ndryshime te konstatuara
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Te gjitha panelet ne gjendje normale
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
