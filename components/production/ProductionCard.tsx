"use client";

interface ProductionCardProps {
  id: number;
  name: string;
  standardBatchKg: number;
  unit: string;
  isUrgent: boolean;
  batchCount: number;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
}

export default function ProductionCard({
  id,
  name,
  standardBatchKg,
  unit,
  isUrgent,
  batchCount,
  onIncrement,
  onDecrement,
}: ProductionCardProps) {
  const isCompleted = batchCount > 0;
  const borderColor = isUrgent
    ? "border-t-secondary-container"
    : isCompleted
      ? "border-t-primary"
      : "border-t-outline-variant";

  return (
    <article
      className={`
        bg-surface-container-lowest rounded-xl shadow-soft-press overflow-hidden
        flex flex-col relative border-t-[6px] ${borderColor}
        ${!isCompleted && !isUrgent ? "opacity-80" : ""}
        transition-all duration-200
      `}
    >
      {/* Top Section */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-headline-md font-[700] text-on-surface">
            {name}
          </h2>
          {isUrgent && (
            <span className="bg-secondary-container text-on-secondary-container font-[700] text-[12px] px-3 py-1 rounded-full">
              Urgent
            </span>
          )}
        </div>
        <p className="text-body-md font-[400] text-on-surface-variant mb-4">
          {isCompleted ? "Batch Produksi Harian" : "Stok Aman"}
        </p>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-outline">
            {isCompleted ? "scale" : "check_circle"}
          </span>
          <span className="text-body-md font-[400] text-on-surface-variant">
            {isCompleted
              ? `Target: ${standardBatchKg} ${unit}`
              : "Target Tercapai"}
          </span>
        </div>
      </div>

      {/* Bottom Section: Counter */}
      <div className="bg-surface-container-low p-4 flex items-center justify-between border-t border-surface-variant">
        <div className="flex flex-col">
          <span className="text-label-bold font-[700] text-on-surface-variant">
            Sesi Ini
          </span>
          <span className="text-display-lg font-[800] text-primary">
            {batchCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Decrement Button */}
          {batchCount > 0 && (
            <button
              onClick={() => onDecrement(id)}
              aria-label={`Kurangi ${name}`}
              className="bg-surface-variant text-on-surface-variant w-12 h-12 rounded-xl flex items-center justify-center border border-outline-variant shadow-soft-press-sm hover:bg-surface-dim transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">
                remove
              </span>
            </button>
          )}

          {/* Increment Button */}
          <button
            onClick={() => onIncrement(id)}
            aria-label={`Tambah ${name}`}
            className="bg-primary text-on-primary w-16 h-16 rounded-xl flex items-center justify-center shadow-soft-press hover:bg-primary-container transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[32px]">add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
