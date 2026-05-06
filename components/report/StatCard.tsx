interface StatCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: string;
}

export default function StatCard({ title, value, unit, icon }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-soft-press relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <span
          className="material-symbols-outlined scale-[2.5] select-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <p className="text-on-surface-variant font-label-bold text-xs mb-1">
        {title}
      </p>
      <p className="text-primary font-display-lg text-[24px] md:text-[32px] leading-tight">
        {value} <span className="text-sm font-label-bold text-on-surface-variant">{unit}</span>
      </p>
    </div>
  );
}
