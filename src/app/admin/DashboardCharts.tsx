"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardChartsProps {
  statusCounts: Record<string, number>;
  popularCars: { name: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  "Ne pritje": "#EAB308",
  "Konfirmuar": "#22C55E",
  "Anulluar": "#EF4444",
};

export function StatusPieChart({ statusCounts }: { statusCounts: Record<string, number> }) {
  const data = [
    { name: "Ne pritje", value: statusCounts.pending || 0 },
    { name: "Konfirmuar", value: statusCounts.confirmed || 0 },
    { name: "Anulluar", value: statusCounts.cancelled || 0 },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Nuk ka te dhena</p>;
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] }} />
            <span className="text-sm text-gray-600">{d.name}</span>
            <span className="text-sm font-bold text-gray-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PopularCarsChart({ popularCars }: { popularCars: { name: string; count: number }[] }) {
  if (popularCars.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Nuk ka te dhena</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={popularCars} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24} name="Rezervime" />
      </BarChart>
    </ResponsiveContainer>
  );
}
