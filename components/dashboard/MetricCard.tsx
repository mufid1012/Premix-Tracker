interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend: number;
  icon: string;
  variant?: "primary" | "secondary";
}

export default function MetricCard({
  title,
  value,
  unit,
  trend,
  icon,
  variant = "primary",
}: MetricCardProps) {
  const isPositive = trend >= 0;
  const trendIcon = isPositive ? "trending_up" : "trending_down";
  const trendColor = variant === "primary"
    ? isPositive ? "text-primary" : "text-error"
    : isPositive ? "text-error" : "text-primary"; // for "bahan" more = bad

  const iconBg = variant === "primary"
    ? "bg-primary-container text-on-primary-container"
    : "bg-secondary-container text-on-secondary-container";

  const decoColor = variant === "primary"
    ? "bg-primary-container/10"
    : "bg-secondary-container/10";

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[20px] shadow-soft-press relative overflow-hidden group">
      {/* Decorative circle */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${decoColor} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-label-bold font-[700] text-on-surface-variant mb-[4px]">
            {title}
          </p>
          <p className="text-display-lg font-[800] tracking-[-0.02em] text-on-surface">
            {value}{" "}
            <span className="text-body-md font-[400] text-on-surface-variant">
              {unit}
            </span>
          </p>
        </div>

        <div
          className={`${iconBg} w-12 h-12 rounded-full flex items-center justify-center`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
      </div>

      <div className={`mt-[12px] flex items-center gap-[4px] ${trendColor}`}>
        <span className="material-symbols-outlined text-[16px]">
          {trendIcon}
        </span>
        <span className="text-label-bold font-[700] text-[12px]">
          {isPositive ? "+" : ""}
          {trend}% dari {variant === "primary" ? "kemarin" : "estimasi"}
        </span>
      </div>
    </div>
  );
}
