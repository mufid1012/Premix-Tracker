interface TrendDataPoint {
  label: string;
  value: number;
  isPeak: boolean;
}

interface SimpleBarChartProps {
  data: TrendDataPoint[];
}

export default function SimpleBarChart({ data }: SimpleBarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1); // hindari bagi 0

  return (
    <div className="bg-white p-5">
      <div className="h-40 flex items-end gap-2 border-b border-line pt-6">
        {data.map((item) => (
          <div
            key={item.label}
            className={`relative flex-1 ${item.isPeak ? "bg-accent" : "bg-line-strong"}`}
            style={{ height: `${Math.max((item.value / maxVal) * 100, 3)}%` }}
          >
            <span
              className={`absolute -top-6 inset-x-0 text-center font-mono text-[12px] ${
                item.isPeak ? "text-accent" : "text-ink-soft"
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((item) => (
          <span key={item.label} className="flex-1 text-center label-mono text-[11px] truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
