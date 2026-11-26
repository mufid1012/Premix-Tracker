"use client";

interface SessionFooterProps {
  totalBatch: number;
  onFinishSession: () => void;
  submitting: boolean;
}

export default function SessionFooter({
  totalBatch,
  onFinishSession,
  submitting,
}: SessionFooterProps) {
  if (totalBatch === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 md:bottom-0 z-40 border-t border-line bg-paper">
      <div className="frame flex items-center gap-4 p-3 md:px-6 md:py-4">
        <p className="hidden md:block flex-1">
          <span className="label-mono">Total produksi sesi ini</span>
          <span className="ml-3 font-display text-[32px] leading-none align-middle">
            {totalBatch}
          </span>
        </p>
        <button
          type="button"
          onClick={onFinishSession}
          disabled={submitting}
          className="btn btn-accent w-full md:w-auto min-h-14"
        >
          {submitting ? (
            "Menyimpan..."
          ) : (
            <>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                check_circle
              </span>
              Selesaikan Sesi ({totalBatch} resep)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
