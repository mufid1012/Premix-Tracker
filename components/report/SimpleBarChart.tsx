interface TrendDataPoint {
  label: string;
  value: number;
  isPeak: boolean;
}

interface SimpleBarChartProps {
  title: string;
  data: TrendDataPoint[];
}

export default function SimpleBarChart({ title, data }: SimpleBarChartProps) {
  // Find max value to calculate heights
  const maxVal = Math.max(...data.map((d) => d.value), 1); // Avoid division by 0

  return (
    <section className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-soft-press space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-[700] text-on-surface leading-tight">
          {title}
        </h3>
        <span className="material-symbols-outlined text-secondary">
          trending_up
        </span>
      </div>

      <div className="h-32 flex items-end justify-between gap-1 pt-4 border-b border-l border-outline-variant/30 px-2">
        {data.length === 0 ? (
          <p className="w-full text-center text-xs text-on-surface-variant mb-2">Belum ada data</p>
        ) : (
          data.map((item, idx) => {
            const heightPercent = Math.max((item.value / maxVal) * 100, 5); // min 5% to show bar

            return (
              <div
                key={idx}
                className={`
                  w-full rounded-t-sm relative group transition-all duration-700
                  ${
                    item.isPeak
                      ? "bg-primary-container border-t-2 border-primary"
                      : "bg-primary-container/20"
                  }
                `}
                style={{ height: `${heightPercent}%` }}
              >
                {/* Tooltip / Value Bubble */}
                <div
                  className={`
                    absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1 rounded
                    ${
                      item.isPeak
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    }
                  `}
                >
                  {item.value}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between text-[10px] text-on-surface-variant font-[700] px-2">
        {data.map((item, idx) => (
          <span key={idx} className="w-full text-center truncate px-0.5">
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
