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
  return (
    <article className="bg-white flex flex-col">
      <h3 className="p-4 flex-1 text-[18px] font-semibold leading-snug">{name}</h3>

      <div className="px-4 pb-4 flex items-end justify-between gap-3">
        <div>
          <p className="label-mono">Jumlah</p>
          <p
            aria-live="polite"
            className={`font-display text-[48px] leading-none ${
              batchCount > 0 ? "text-accent" : "text-ink-soft"
            }`}
          >
            {batchCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDecrement(id)}
            disabled={batchCount === 0}
            aria-label={`Kurangi ${name}`}
            className="btn btn-line btn-icon h-14 w-14"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              remove
            </span>
          </button>
          <button
            type="button"
            onClick={() => onIncrement(id)}
            aria-label={`Tambah ${name}`}
            className="btn btn-dark btn-icon h-14 w-14"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[28px]">
              add
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
