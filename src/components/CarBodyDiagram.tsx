"use client";

import { useState } from "react";

interface PerformanceData {
  [key: string]: string[] | null;
}

interface CarBodyDiagramProps {
  performanceData?: PerformanceData | null;
}

// Damage type colors and labels (matching Encar's system)
const DAMAGE_TYPES: Record<string, { letter: string; color: string; bg: string; label: string }> = {
  CHANGE: { letter: "X", color: "#dc2626", bg: "bg-red-500", label: "Nderruar" },
  METAL: { letter: "W", color: "#ea580c", bg: "bg-orange-500", label: "Llamarine/Saldim" },
  CORROSION: { letter: "C", color: "#ca8a04", bg: "bg-yellow-500", label: "Korrozion" },
  SCRATCH: { letter: "A", color: "#2563eb", bg: "bg-blue-500", label: "Gervishje" },
  HILLS: { letter: "U", color: "#7c3aed", bg: "bg-purple-500", label: "Siperfaqe e pabarabarte" },
  DAMAGE: { letter: "T", color: "#dc2626", bg: "bg-red-600", label: "Demtim" },
};

// Exterior panel positions (on the 254x282 skin image)
const EXTERIOR_PANELS: Record<string, { left: number; top: number; label: string }> = {
  radiatorSupport: { left: 120, top: 13, label: "Suporti i radiatorit" },
  hood: { left: 120, top: 47, label: "Kapaku" },
  frontFenderLeft: { left: 33, top: 66, label: "Krahori i perp. majtas" },
  frontFenderRight: { left: 202, top: 66, label: "Krahori i perp. djathtas" },
  frontDoorLeft: { left: 33, top: 115, label: "Dera e perp. majtas" },
  frontDoorRight: { left: 202, top: 115, label: "Dera e perp. djathtas" },
  sideSillPanelLeft: { left: 4, top: 140, label: "Pragu majtas" },
  sideSillPanelRight: { left: 233, top: 140, label: "Pragu djathtas" },
  rearDoorLeft: { left: 33, top: 165, label: "Dera e pasme majtas" },
  rearDoorRight: { left: 202, top: 165, label: "Dera e pasme djathtas" },
  roofPanel: { left: 120, top: 170, label: "Paneli i catise" },
  quarterPanelLeft: { left: 37, top: 211, label: "Paneli i pasem majtas" },
  quarterPanelRight: { left: 199, top: 211, label: "Paneli i pasem djathtas" },
  trunkLead: { left: 120, top: 235, label: "Kapaku i bagazhit" },
};

// Structural panel positions (on the 254x282 skeleton image)
// Original Encar positions are relative to a combined container (skin+skeleton side by side)
// Skeleton image starts at x=480 in Encar, so we subtract ~480 to get local coords
const STRUCTURAL_PANELS: Record<string, { left: number; top: number; label: string }> = {
  frontPanel: { left: 34, top: 33, label: "Paneli i perp." },
  insidePanelLeft: { left: 0, top: 56, label: "Paneli i brendshem majtas" },
  insidePanelRight: { left: 65, top: 56, label: "Paneli i brendshem djathtas" },
  frontSideMemberLeft: { left: 17, top: 63, label: "Traversa anesore perp. majtas" },
  frontSideMemberRight: { left: 48, top: 63, label: "Traversa anesore perp. djathtas" },
  frontWheelHouseLeft: { left: 0, top: 77, label: "Kalota e perp. majtas" },
  frontWheelHouseRight: { left: 65, top: 77, label: "Kalota e perp. djathtas" },
  crossMember: { left: 34, top: 90, label: "Traversa" },
  dashPanel: { left: 34, top: 108, label: "Paneli i instrumenteve" },
  pillarPanelFrontLeft: { left: -25, top: 112, label: "Shtylla A majtas" },
  pillarPanelFrontRight: { left: 93, top: 112, label: "Shtylla A djathtas" },
  floorPanel: { left: 34, top: 145, label: "Paneli i dyshemese" },
  pillarPanelMiddleLeft: { left: -30, top: 142, label: "Shtylla B majtas" },
  pillarPanelMiddleRight: { left: 95, top: 142, label: "Shtylla B djathtas" },
  pillarPanelRearLeft: { left: -22, top: 178, label: "Shtylla C majtas" },
  pillarPanelRearRight: { left: 89, top: 178, label: "Shtylla C djathtas" },
  rearDashPanel: { left: 34, top: 184, label: "Paneli i pasem i instrumenteve" },
  packageTray: { left: 34, top: 185, label: "Rrasa e paketimit" },
  rearWheelHouseLeft: { left: -2, top: 211, label: "Kalota e pasme majtas" },
  rearWheelHouseRight: { left: 70, top: 211, label: "Kalota e pasme djathtas" },
  rearSideMemberLeft: { left: 14, top: 217, label: "Traversa anesore pasme majtas" },
  trunkFloor: { left: 34, top: 217, label: "Dyshemeja e bagazhit" },
  rearSideMemberRight: { left: 55, top: 217, label: "Traversa anesore pasme djathtas" },
  rearPanel: { left: 34, top: 240, label: "Paneli i pasem" },
};

// Rank classification for exterior panels
const RANK1_PANELS = ["hood", "frontFenderLeft", "frontFenderRight", "frontDoorLeft", "frontDoorRight",
  "rearDoorLeft", "rearDoorRight", "trunkLead"];
const RANK2_PANELS = ["radiatorSupport", "roofPanel", "quarterPanelLeft", "quarterPanelRight",
  "sideSillPanelLeft", "sideSillPanelRight"];

// Rank classification for structural panels
const RANK_A_PANELS = ["frontPanel", "crossMember", "insidePanelLeft", "insidePanelRight",
  "frontWheelHouseLeft", "frontWheelHouseRight", "rearPanel", "trunkFloor",
  "rearWheelHouseLeft", "rearWheelHouseRight"];
const RANK_B_PANELS = ["pillarPanelFrontLeft", "pillarPanelFrontRight", "pillarPanelMiddleLeft",
  "pillarPanelMiddleRight", "pillarPanelRearLeft", "pillarPanelRearRight",
  "dashPanel", "floorPanel", "packageTray", "rearDashPanel"];
const RANK_C_PANELS = ["frontSideMemberLeft", "frontSideMemberRight",
  "rearSideMemberLeft", "rearSideMemberRight"];

function DamageMarker({ damages, left, top, label, onClick, isSelected }: {
  damages: string[];
  left: number;
  top: number;
  label: string;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <div
      className="absolute flex flex-col gap-0.5 cursor-pointer z-10"
      style={{ left: `${left}px`, top: `${top}px`, transform: "translate(-50%, -50%)" }}
      onClick={onClick}
      title={label}
    >
      {damages.map((dmg, i) => {
        const info = DAMAGE_TYPES[dmg];
        if (!info) return null;
        return (
          <div
            key={i}
            className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${isSelected ? "ring-2 ring-offset-1 ring-gray-900" : ""}`}
            style={{ backgroundColor: info.color }}
          >
            {info.letter}
          </div>
        );
      })}
    </div>
  );
}

function getRankDamages(data: PerformanceData, panels: string[]) {
  const damages: { panel: string; label: string; types: string[] }[] = [];
  for (const key of panels) {
    const val = data[key];
    if (val && val.length > 0) {
      const panel = EXTERIOR_PANELS[key] || STRUCTURAL_PANELS[key];
      if (panel) {
        damages.push({ panel: key, label: panel.label, types: val });
      }
    }
  }
  return damages;
}

export default function CarBodyDiagram({ performanceData }: CarBodyDiagramProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!performanceData) return null;

  // Check if there's any damage at all
  const hasAnyDamage = Object.values(performanceData).some(v => v && v.length > 0);

  // Get damages by rank
  const rank1Damages = getRankDamages(performanceData, RANK1_PANELS);
  const rank2Damages = getRankDamages(performanceData, RANK2_PANELS);
  const rankADamages = getRankDamages(performanceData, RANK_A_PANELS);
  const rankBDamages = getRankDamages(performanceData, RANK_B_PANELS);
  const rankCDamages = getRankDamages(performanceData, RANK_C_PANELS);

  const selectedPanel = selected
    ? (EXTERIOR_PANELS[selected] || STRUCTURAL_PANELS[selected])
    : null;
  const selectedDamages = selected ? performanceData[selected] : null;

  return (
    <div className="mb-5">
      <h3 className="font-semibold text-gray-900 mb-3">Diagrama e paneleve</h3>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mb-4 text-[11px] text-gray-600">
          {Object.entries(DAMAGE_TYPES).map(([code, info]) => (
            <span key={code} className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                style={{ backgroundColor: info.color }}>{info.letter}</span>
              {info.label}
            </span>
          ))}
        </div>

        {/* Selected panel info */}
        {selected && selectedPanel && selectedDamages && (
          <div className="mb-3 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gray-100 border border-gray-200">
              <span className="font-medium text-gray-900">{selectedPanel.label}</span>
              <span className="text-gray-400">-</span>
              {selectedDamages.map((dmg, i) => {
                const info = DAMAGE_TYPES[dmg];
                return info ? (
                  <span key={i} className="inline-flex items-center gap-1" style={{ color: info.color }}>
                    <span className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: info.color }}>{info.letter}</span>
                    {info.label}
                  </span>
                ) : null;
              })}
            </span>
          </div>
        )}

        {/* Two diagrams side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exterior (Skin) */}
          <div>
            <div className="text-center text-sm font-semibold text-gray-700 mb-2">Eksteri</div>
            <div className="relative mx-auto" style={{ width: "254px", height: "282px" }}>
              <div className="text-[10px] text-gray-400 text-center absolute -top-3 left-0 right-0">Para</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.encar.com/images/pop/check/img_inspection01.gif"
                alt="Eksteri"
                width={254}
                height={282}
                className="w-full h-full"
              />
              {/* Damage markers */}
              {Object.entries(EXTERIOR_PANELS).map(([key, pos]) => {
                const damages = performanceData[key];
                if (!damages || damages.length === 0) return null;
                return (
                  <DamageMarker
                    key={key}
                    damages={damages}
                    left={pos.left}
                    top={pos.top}
                    label={pos.label}
                    onClick={() => setSelected(selected === key ? null : key)}
                    isSelected={selected === key}
                  />
                );
              })}
              <div className="text-[10px] text-gray-400 text-center absolute -bottom-3 left-0 right-0">Mbrapa</div>
            </div>

            {/* Rank list */}
            <div className="mt-5 space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-700 text-xs">Ranku 1</span>
                {rank1Damages.length === 0 ? (
                  <span className="text-xs text-gray-400 ml-2">Nuk ka ndryshime</span>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {rank1Damages.map(d => (
                      <li key={d.panel} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-700">{d.label}</span>
                        <div className="flex gap-1">
                          {d.types.map((t, i) => {
                            const info = DAMAGE_TYPES[t];
                            return info ? (
                              <span key={i} className="w-4 h-4 rounded-full text-white text-[7px] font-bold flex items-center justify-center"
                                style={{ backgroundColor: info.color }}>{info.letter}</span>
                            ) : null;
                          })}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <span className="font-semibold text-gray-700 text-xs">Ranku 2</span>
                {rank2Damages.length === 0 ? (
                  <span className="text-xs text-gray-400 ml-2">Nuk ka ndryshime</span>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {rank2Damages.map(d => (
                      <li key={d.panel} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-700">{d.label}</span>
                        <div className="flex gap-1">
                          {d.types.map((t, i) => {
                            const info = DAMAGE_TYPES[t];
                            return info ? (
                              <span key={i} className="w-4 h-4 rounded-full text-white text-[7px] font-bold flex items-center justify-center"
                                style={{ backgroundColor: info.color }}>{info.letter}</span>
                            ) : null;
                          })}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Structural (Skeleton) */}
          <div>
            <div className="text-center text-sm font-semibold text-gray-700 mb-2">Struktura</div>
            <div className="relative mx-auto" style={{ width: "254px", height: "282px" }}>
              <div className="text-[10px] text-gray-400 text-center absolute -top-3 left-0 right-0">Para</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.encar.com/images/pop/check/img_inspection02_new.gif"
                alt="Struktura"
                width={254}
                height={282}
                className="w-full h-full"
              />
              {/* Damage markers */}
              {Object.entries(STRUCTURAL_PANELS).map(([key, pos]) => {
                const damages = performanceData[key];
                if (!damages || damages.length === 0) return null;
                return (
                  <DamageMarker
                    key={key}
                    damages={damages}
                    left={pos.left}
                    top={pos.top}
                    label={pos.label}
                    onClick={() => setSelected(selected === key ? null : key)}
                    isSelected={selected === key}
                  />
                );
              })}
              <div className="text-[10px] text-gray-400 text-center absolute -bottom-3 left-0 right-0">Mbrapa</div>
            </div>

            {/* Rank list */}
            <div className="mt-5 space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-700 text-xs">Ranku A</span>
                {rankADamages.length === 0 ? (
                  <span className="text-xs text-gray-400 ml-2">Nuk ka ndryshime</span>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {rankADamages.map(d => (
                      <li key={d.panel} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-700">{d.label}</span>
                        <div className="flex gap-1">
                          {d.types.map((t, i) => {
                            const info = DAMAGE_TYPES[t];
                            return info ? (
                              <span key={i} className="w-4 h-4 rounded-full text-white text-[7px] font-bold flex items-center justify-center"
                                style={{ backgroundColor: info.color }}>{info.letter}</span>
                            ) : null;
                          })}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <span className="font-semibold text-gray-700 text-xs">Ranku B</span>
                {rankBDamages.length === 0 ? (
                  <span className="text-xs text-gray-400 ml-2">Nuk ka ndryshime</span>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {rankBDamages.map(d => (
                      <li key={d.panel} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-700">{d.label}</span>
                        <div className="flex gap-1">
                          {d.types.map((t, i) => {
                            const info = DAMAGE_TYPES[t];
                            return info ? (
                              <span key={i} className="w-4 h-4 rounded-full text-white text-[7px] font-bold flex items-center justify-center"
                                style={{ backgroundColor: info.color }}>{info.letter}</span>
                            ) : null;
                          })}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <span className="font-semibold text-gray-700 text-xs">Ranku C</span>
                {rankCDamages.length === 0 ? (
                  <span className="text-xs text-gray-400 ml-2">Nuk ka ndryshime</span>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {rankCDamages.map(d => (
                      <li key={d.panel} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-700">{d.label}</span>
                        <div className="flex gap-1">
                          {d.types.map((t, i) => {
                            const info = DAMAGE_TYPES[t];
                            return info ? (
                              <span key={i} className="w-4 h-4 rounded-full text-white text-[7px] font-bold flex items-center justify-center"
                                style={{ backgroundColor: info.color }}>{info.letter}</span>
                            ) : null;
                          })}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overall status */}
        <div className="text-center mt-4">
          {hasAnyDamage ? (
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
