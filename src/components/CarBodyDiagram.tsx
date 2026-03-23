"use client";

import { useState } from "react";

interface PanelData {
  name: string;
  resultCode?: string;
  label: string;
  color: string;
}

interface CarBodyDiagramProps {
  diagnosisItems?: any[];
  inspectionOuters?: any[];
}

// Map diagnosis item names to SVG panel IDs
const PANEL_POSITIONS: Record<string, { id: string; label: string }> = {
  HOOD: { id: "hood", label: "Kapaku" },
  FRONT_FENDER_LEFT: { id: "front-fender-left", label: "Krahori i perp. majtas" },
  FRONT_FENDER_RIGHT: { id: "front-fender-right", label: "Krahori i perp. djathtas" },
  FRONT_DOOR_LEFT: { id: "front-door-left", label: "Dera e perp. majtas" },
  FRONT_DOOR_RIGHT: { id: "front-door-right", label: "Dera e perp. djathtas" },
  BACK_DOOR_LEFT: { id: "back-door-left", label: "Dera e pasme majtas" },
  BACK_DOOR_RIGHT: { id: "back-door-right", label: "Dera e pasme djathtas" },
  TRUNK_LID: { id: "trunk", label: "Kapaku i bagazhit" },
  ROOF_PANEL: { id: "roof", label: "Paneli i catise" },
  QUARTER_PANEL_LEFT: { id: "quarter-left", label: "Paneli i pasem majtas" },
  QUARTER_PANEL_RIGHT: { id: "quarter-right", label: "Paneli i pasem djathtas" },
  SIDE_SILL_LEFT: { id: "sill-left", label: "Pragu majtas" },
  SIDE_SILL_RIGHT: { id: "sill-right", label: "Pragu djathtas" },
  FRONT_PANEL: { id: "front-panel", label: "Paneli i perp." },
  REAR_PANEL: { id: "rear-panel", label: "Paneli i pasem" },
  PILLAR_A_LEFT: { id: "pillar-a-left", label: "Shtylla A majtas" },
  PILLAR_A_RIGHT: { id: "pillar-a-right", label: "Shtylla A djathtas" },
  PILLAR_B_LEFT: { id: "pillar-b-left", label: "Shtylla B majtas" },
  PILLAR_B_RIGHT: { id: "pillar-b-right", label: "Shtylla B djathtas" },
  PILLAR_C_LEFT: { id: "pillar-c-left", label: "Shtylla C majtas" },
  PILLAR_C_RIGHT: { id: "pillar-c-right", label: "Shtylla C djathtas" },
};

const RESULT_COLORS: Record<string, string> = {
  NORMAL: "#22c55e",
  REPLACEMENT: "#ef4444",
  SHEET_METAL: "#f97316",
  CORROSION: "#eab308",
  SCRATCH: "#3b82f6",
  UNEVEN: "#a855f7",
  DAMAGE: "#ef4444",
};

const RESULT_LABELS: Record<string, string> = {
  NORMAL: "Normal",
  REPLACEMENT: "Nderruar",
  SHEET_METAL: "Llamarine",
  CORROSION: "Korrozion",
  SCRATCH: "Gervishje",
  UNEVEN: "E pabarabarte",
  DAMAGE: "Demtim",
};

export default function CarBodyDiagram({ diagnosisItems, inspectionOuters }: CarBodyDiagramProps) {
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ label: string; status: string; color: string } | null>(null);

  // Build panel status map from diagnosis items
  const panelStatus: Record<string, { resultCode: string; color: string; label: string }> = {};

  if (diagnosisItems) {
    diagnosisItems.forEach((item: any) => {
      if (item.resultCode && item.name && PANEL_POSITIONS[item.name]) {
        const panelId = PANEL_POSITIONS[item.name].id;
        panelStatus[panelId] = {
          resultCode: item.resultCode,
          color: RESULT_COLORS[item.resultCode] || "#d1d5db",
          label: RESULT_LABELS[item.resultCode] || item.resultCode,
        };
      }
    });
  }

  const getPanelColor = (panelId: string) => {
    if (panelStatus[panelId]) {
      return panelStatus[panelId].color;
    }
    return "#d1d5db"; // gray for unknown
  };

  const getPanelOpacity = (panelId: string) => {
    if (hoveredPanel === panelId) return 0.9;
    if (panelStatus[panelId]?.resultCode === "NORMAL") return 0.4;
    return 0.6;
  };

  const handleHover = (panelId: string, panelName: string) => {
    setHoveredPanel(panelId);
    const status = panelStatus[panelId];
    setTooltipInfo({
      label: panelName,
      status: status?.label || "Pa te dhena",
      color: status?.color || "#d1d5db",
    });
  };

  const handleLeave = () => {
    setHoveredPanel(null);
    setTooltipInfo(null);
  };

  const hasData = diagnosisItems && diagnosisItems.some(
    (item: any) => item.resultCode && PANEL_POSITIONS[item.name]
  );

  if (!hasData) return null;

  const hasIssues = Object.values(panelStatus).some(p => p.resultCode !== "NORMAL");

  return (
    <div className="mb-5">
      <h3 className="font-semibold text-gray-900 mb-3">Diagrama e paneleve</h3>
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col items-center">
          {/* Tooltip */}
          {tooltipInfo && (
            <div className="mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
              <span className="font-medium">{tooltipInfo.label}</span>
              <span className="mx-1.5">·</span>
              <span style={{ color: tooltipInfo.color }}>{tooltipInfo.status}</span>
            </div>
          )}
          {!tooltipInfo && (
            <div className="mb-2 px-3 py-1.5 text-gray-400 text-xs">
              Prekni nje panel per detaje
            </div>
          )}

          {/* Car SVG - Top View */}
          <svg viewBox="0 0 200 420" className="w-full max-w-[220px]" xmlns="http://www.w3.org/2000/svg">
            {/* Car body outline */}
            <path
              d="M60,40 Q65,10 100,8 Q135,10 140,40 L145,80 L148,120 L150,180 L150,280 L148,340 L145,370 Q140,400 100,410 Q60,400 55,370 L52,340 L50,280 L50,180 L52,120 L55,80 Z"
              fill="none"
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Front Panel */}
            <path
              d="M65,35 Q70,18 100,15 Q130,18 135,35 L138,55 L62,55 Z"
              fill={getPanelColor("front-panel")}
              opacity={getPanelOpacity("front-panel")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("front-panel", "Paneli i perp.")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("front-panel", "Paneli i perp.")}
            />

            {/* Hood */}
            <path
              d="M62,55 L138,55 L142,110 L58,110 Z"
              fill={getPanelColor("hood")}
              opacity={getPanelOpacity("hood")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("hood", "Kapaku")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("hood", "Kapaku")}
            />

            {/* Windshield */}
            <path
              d="M58,110 L142,110 L145,145 L55,145 Z"
              fill="#bfdbfe"
              opacity={0.5}
              stroke="#374151"
              strokeWidth="1"
            />

            {/* Front Fender Left */}
            <path
              d="M50,55 L62,55 L58,110 L50,110 L48,80 Z"
              fill={getPanelColor("front-fender-left")}
              opacity={getPanelOpacity("front-fender-left")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("front-fender-left", "Krahori i perp. majtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("front-fender-left", "Krahori i perp. majtas")}
            />

            {/* Front Fender Right */}
            <path
              d="M138,55 L150,55 L152,80 L150,110 L142,110 Z"
              fill={getPanelColor("front-fender-right")}
              opacity={getPanelOpacity("front-fender-right")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("front-fender-right", "Krahori i perp. djathtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("front-fender-right", "Krahori i perp. djathtas")}
            />

            {/* Pillar A Left */}
            <rect
              x="48" y="110" width="7" height="35"
              fill={getPanelColor("pillar-a-left")}
              opacity={getPanelOpacity("pillar-a-left")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("pillar-a-left", "Shtylla A majtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("pillar-a-left", "Shtylla A majtas")}
            />

            {/* Pillar A Right */}
            <rect
              x="145" y="110" width="7" height="35"
              fill={getPanelColor("pillar-a-right")}
              opacity={getPanelOpacity("pillar-a-right")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("pillar-a-right", "Shtylla A djathtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("pillar-a-right", "Shtylla A djathtas")}
            />

            {/* Front Door Left */}
            <path
              d="M48,145 L55,145 L55,215 L48,215 Z"
              fill={getPanelColor("front-door-left")}
              opacity={getPanelOpacity("front-door-left")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("front-door-left", "Dera e perp. majtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("front-door-left", "Dera e perp. majtas")}
            />

            {/* Front Door Right */}
            <path
              d="M145,145 L152,145 L152,215 L145,215 Z"
              fill={getPanelColor("front-door-right")}
              opacity={getPanelOpacity("front-door-right")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("front-door-right", "Dera e perp. djathtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("front-door-right", "Dera e perp. djathtas")}
            />

            {/* Pillar B Left */}
            <rect
              x="48" y="215" width="7" height="20"
              fill={getPanelColor("pillar-b-left")}
              opacity={getPanelOpacity("pillar-b-left")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("pillar-b-left", "Shtylla B majtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("pillar-b-left", "Shtylla B majtas")}
            />

            {/* Pillar B Right */}
            <rect
              x="145" y="215" width="7" height="20"
              fill={getPanelColor("pillar-b-right")}
              opacity={getPanelOpacity("pillar-b-right")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("pillar-b-right", "Shtylla B djathtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("pillar-b-right", "Shtylla B djathtas")}
            />

            {/* Back Door Left */}
            <path
              d="M48,235 L55,235 L55,300 L48,300 Z"
              fill={getPanelColor("back-door-left")}
              opacity={getPanelOpacity("back-door-left")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("back-door-left", "Dera e pasme majtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("back-door-left", "Dera e pasme majtas")}
            />

            {/* Back Door Right */}
            <path
              d="M145,235 L152,235 L152,300 L145,300 Z"
              fill={getPanelColor("back-door-right")}
              opacity={getPanelOpacity("back-door-right")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("back-door-right", "Dera e pasme djathtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("back-door-right", "Dera e pasme djathtas")}
            />

            {/* Roof */}
            <path
              d="M55,145 L145,145 L145,310 L55,310 Z"
              fill={getPanelColor("roof")}
              opacity={getPanelOpacity("roof")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("roof", "Paneli i catise")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("roof", "Paneli i catise")}
            />

            {/* Sill Left */}
            <rect
              x="44" y="145" width="4" height="170"
              fill={getPanelColor("sill-left")}
              opacity={getPanelOpacity("sill-left")}
              stroke="#374151"
              strokeWidth="0.5"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("sill-left", "Pragu majtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("sill-left", "Pragu majtas")}
            />

            {/* Sill Right */}
            <rect
              x="152" y="145" width="4" height="170"
              fill={getPanelColor("sill-right")}
              opacity={getPanelOpacity("sill-right")}
              stroke="#374151"
              strokeWidth="0.5"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("sill-right", "Pragu djathtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("sill-right", "Pragu djathtas")}
            />

            {/* Pillar C Left */}
            <rect
              x="48" y="300" width="7" height="20"
              fill={getPanelColor("pillar-c-left")}
              opacity={getPanelOpacity("pillar-c-left")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("pillar-c-left", "Shtylla C majtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("pillar-c-left", "Shtylla C majtas")}
            />

            {/* Pillar C Right */}
            <rect
              x="145" y="300" width="7" height="20"
              fill={getPanelColor("pillar-c-right")}
              opacity={getPanelOpacity("pillar-c-right")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("pillar-c-right", "Shtylla C djathtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("pillar-c-right", "Shtylla C djathtas")}
            />

            {/* Quarter Panel Left */}
            <path
              d="M48,320 L55,310 L55,350 L50,350 Z"
              fill={getPanelColor("quarter-left")}
              opacity={getPanelOpacity("quarter-left")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("quarter-left", "Paneli i pasem majtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("quarter-left", "Paneli i pasem majtas")}
            />

            {/* Quarter Panel Right */}
            <path
              d="M145,310 L152,320 L150,350 L145,350 Z"
              fill={getPanelColor("quarter-right")}
              opacity={getPanelOpacity("quarter-right")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("quarter-right", "Paneli i pasem djathtas")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("quarter-right", "Paneli i pasem djathtas")}
            />

            {/* Rear Windshield */}
            <path
              d="M55,310 L145,310 L142,345 L58,345 Z"
              fill="#bfdbfe"
              opacity={0.5}
              stroke="#374151"
              strokeWidth="1"
            />

            {/* Trunk */}
            <path
              d="M58,345 L142,345 L138,385 L62,385 Z"
              fill={getPanelColor("trunk")}
              opacity={getPanelOpacity("trunk")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("trunk", "Kapaku i bagazhit")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("trunk", "Kapaku i bagazhit")}
            />

            {/* Rear Panel */}
            <path
              d="M62,385 L138,385 Q135,400 100,405 Q65,400 62,385 Z"
              fill={getPanelColor("rear-panel")}
              opacity={getPanelOpacity("rear-panel")}
              stroke="#374151"
              strokeWidth="1"
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => handleHover("rear-panel", "Paneli i pasem")}
              onMouseLeave={handleLeave}
              onClick={() => handleHover("rear-panel", "Paneli i pasem")}
            />

            {/* Wheels */}
            <ellipse cx="42" cy="90" rx="8" ry="16" fill="#1f2937" opacity="0.7" />
            <ellipse cx="158" cy="90" rx="8" ry="16" fill="#1f2937" opacity="0.7" />
            <ellipse cx="42" cy="330" rx="8" ry="16" fill="#1f2937" opacity="0.7" />
            <ellipse cx="158" cy="330" rx="8" ry="16" fill="#1f2937" opacity="0.7" />

            {/* Headlights */}
            <ellipse cx="72" cy="30" rx="8" ry="5" fill="#fbbf24" opacity="0.6" />
            <ellipse cx="128" cy="30" rx="8" ry="5" fill="#fbbf24" opacity="0.6" />

            {/* Taillights */}
            <ellipse cx="72" cy="395" rx="8" ry="5" fill="#ef4444" opacity="0.6" />
            <ellipse cx="128" cy="395" rx="8" ry="5" fill="#ef4444" opacity="0.6" />

            {/* Side mirrors */}
            <ellipse cx="40" cy="130" rx="6" ry="4" fill="#6b7280" opacity="0.5" />
            <ellipse cx="160" cy="130" rx="6" ry="4" fill="#6b7280" opacity="0.5" />

            {/* Direction labels */}
            <text x="100" y="7" textAnchor="middle" className="text-[8px] fill-gray-400 font-medium">PARA</text>
            <text x="100" y="418" textAnchor="middle" className="text-[8px] fill-gray-400 font-medium">PRAPA</text>
            <text x="30" y="220" textAnchor="middle" className="text-[7px] fill-gray-400" transform="rotate(-90, 30, 220)">MAJTAS</text>
            <text x="170" y="220" textAnchor="middle" className="text-[7px] fill-gray-400" transform="rotate(90, 170, 220)">DJATHTAS</text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22c55e", opacity: 0.5 }}></span>
              Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444", opacity: 0.7 }}></span>
              Nderruar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#f97316", opacity: 0.7 }}></span>
              Llamarine
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#eab308", opacity: 0.7 }}></span>
              Korrozion
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3b82f6", opacity: 0.7 }}></span>
              Gervishje
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#a855f7", opacity: 0.7 }}></span>
              E pabarabarte
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#d1d5db", opacity: 0.7 }}></span>
              Pa te dhena
            </span>
          </div>

          {/* Summary badge */}
          {hasIssues ? (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Ka ndryshime te konstatuara
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
