"use client";

interface ProductionCardProps {
  id: number;
  name: string;
  batchCount: number;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
}

export default function ProductionCard({
  id,
  name,
  batchCount,
  onIncrement,
  onDecrement,
}: ProductionCardProps) {
  const borderColor = batchCount > 0 ? "border-t-primary" : "border-t-outline-variant";

  return (
    <article
      className={`
        bg-surface-container-lowest rounded-xl shadow-soft-press overflow-hidden
        flex flex-col relative border-t-[6px] ${borderColor}
        ${batchCount === 0 ? "opacity-80" : ""}
        transition-all duration-200
      `}
    >
      {/* Top Section */}
      <div className="p-4 flex-1">
        <h2 className="text-headline-md font-[700] text-on-surface">
          {name}
        </h2>
      </div>

      {/* Bottom Section: Counter */}
      <div className="bg-surface-container-low p-4 flex items-center justify-between border-t border-surface-variant">
        <div className="flex flex-col">
          <span className="text-label-bold font-[700] text-on-surface-variant">
            Jumlah
          </span>
          <span className="text-display-lg font-[800] text-primary">
            {batchCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
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
