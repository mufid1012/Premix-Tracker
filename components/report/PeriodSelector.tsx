"use client";

interface PeriodSelectorProps {
  period: "harian" | "mingguan" | "bulanan";
  onChange: (period: "harian" | "mingguan" | "bulanan") => void;
}

export default function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  const options = [
    { id: "harian", label: "Harian" },
    { id: "mingguan", label: "Mingguan" },
    { id: "bulanan", label: "Bulanan" },
  ] as const;

  return (
    <section className="space-y-3">
      <p className="font-label-bold text-label-bold text-on-surface-variant">
        Pilih Periode Laporan
      </p>
      <div className="bg-surface-container-high p-1 rounded-xl flex gap-1">
        {options.map((opt) => {
          const isActive = period === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`
                flex-1 py-2 rounded-lg font-label-bold transition-all
                ${
                  isActive
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-highest"
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
