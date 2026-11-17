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

// Recharts butuh nilai warna langsung; sama dengan token di globals.css.
const LINE = "#828c97";
const INK_SOFT = "#565e67";
const ACCENT = "#0067df";

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="bg-white p-4 md:p-6">
      <div className="h-64 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid stroke={LINE} strokeOpacity={0.35} vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: INK_SOFT, fontFamily: "var(--font-jetbrains)" }}
              tickLine={false}
              axisLine={{ stroke: LINE }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: INK_SOFT }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: `1px solid ${LINE}`,
                borderRadius: 0,
                fontSize: "14px",
              }}
              labelStyle={{ color: "#000", fontWeight: 600 }}
              formatter={(value) => [`${value} Kg`, "Bahan terpakai"]}
              cursor={{ fill: "rgba(130, 140, 151, 0.12)" }}
            />
            <Bar dataKey="value" maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isPeak ? ACCENT : LINE} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 label-mono">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="w-3 h-3 bg-line" />
          Normal
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="w-3 h-3 bg-accent" />
          Puncak
        </span>
      </div>
    </div>
  );
}
