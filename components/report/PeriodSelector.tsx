"use client";

type Period = "harian" | "mingguan" | "bulanan";

interface PeriodSelectorProps {
  period: Period;
  onChange: (period: Period) => void;
}

const OPTIONS: Array<{ id: Period; label: string }> = [
  { id: "harian", label: "Harian" },
  { id: "mingguan", label: "Mingguan" },
  { id: "bulanan", label: "Bulanan" },
];

export default function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  return (
    <div role="group" aria-label="Periode laporan" className="grid grid-cols-3 bg-white">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          aria-pressed={period === opt.id}
          className={`min-h-14 font-mono text-[13px] uppercase border-l border-line first:border-l-0 transition-colors ${
            period === opt.id ? "bg-band text-white" : "text-ink hover:bg-paper active:bg-panel"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
