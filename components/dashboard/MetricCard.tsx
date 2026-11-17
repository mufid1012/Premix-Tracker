interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  /** Perubahan dalam persen dibanding kemarin. Kosongkan bila tidak ada data pembanding yang nyata. */
  trend?: number;
}

export default function MetricCard({ title, value, unit, trend }: MetricCardProps) {
  return (
    <div className="bg-white p-5 md:p-8">
      <p className="label-mono">{title}</p>
      <p className="mt-3 font-display text-[48px] md:text-[64px] leading-none">
        {value}
        <span className="ml-2 font-sans text-[16px] text-ink-soft">{unit}</span>
      </p>
      {trend !== undefined && (
        <p className="mt-3 flex items-center gap-1 text-[14px] text-ink-soft">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            {trend >= 0 ? "trending_up" : "trending_down"}
          </span>
          {trend >= 0 ? "+" : ""}
          {trend}% dari kemarin
        </p>
      )}
    </div>
  );
}
