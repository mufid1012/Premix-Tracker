interface TopItem {
  name: string;
  value: number;
  unit: string;
  percentage: number;
}

interface TopProgressBarProps {
  title: string;
  icon: string;
  items: TopItem[];
}

export default function TopProgressBar({ title, icon, items }: TopProgressBarProps) {
  // Define bar colors corresponding to primary, secondary, tertiary containers
  const barColors = [
    "bg-primary",
    "bg-secondary",
    "bg-tertiary",
  ];

  return (
    <section className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-soft-press space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-[700] text-on-surface leading-tight">
          {title}
        </h3>
        <span
          className="material-symbols-outlined text-secondary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>

      <div className="space-y-5">
        {items.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant text-center py-2">
            Belum ada data
          </p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-xs font-[700] text-on-surface-variant">
                <span>{item.name}</span>
                <span>
                  {item.value} {item.unit}
                </span>
              </div>
              <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    barColors[idx % barColors.length]
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
