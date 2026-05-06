"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TrendDataPoint {
  day: string;
  value: number;
  isPeak: boolean;
}

interface TrendChartProps {
  data: TrendDataPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[20px] shadow-soft-press">
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h3 className="text-[20px] font-bold text-on-surface">
          Tren Penggunaan Bahan
        </h3>
        <button className="text-on-surface-variant hover:text-on-surface p-2 rounded-full transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      {/* Chart */}
      <div className="h-64 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(194, 201, 187, 0.3)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{
                fontSize: 12,
                fontWeight: 700,
                fill: "#42493e",
              }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{
                fontSize: 11,
                fill: "#72796e",
              }}
              tickLine={false}
              axisLine={false}
              width={35}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #c2c9bb",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(74, 50, 31, 0.1)",
                fontSize: "14px",
                fontWeight: 700,
              }}
              labelStyle={{ color: "#1c1c19", fontWeight: 700 }}
              formatter={(value: number) => [`${value} Kg`, "Bahan Terpakai"]}
              cursor={{ fill: "rgba(45, 90, 39, 0.05)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPeak ? "#7c5800" : "#2d5a27"}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-[20px] flex items-center justify-center gap-[20px]">
        <div className="flex items-center gap-[4px]">
          <div className="w-3 h-3 bg-primary-container rounded-full" />
          <span className="text-label-bold font-[700] text-[12px] text-on-surface-variant">
            Normal
          </span>
        </div>
        <div className="flex items-center gap-[4px]">
          <div className="w-3 h-3 bg-secondary rounded-full" />
          <span className="text-label-bold font-[700] text-[12px] text-on-surface-variant">
            Puncak
          </span>
        </div>
      </div>
    </div>
  );
}
