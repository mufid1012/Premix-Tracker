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
    <>
      {/* Mobile: Sticky bottom button */}
      <div className="md:hidden fixed bottom-20 left-0 w-full px-[20px] pb-[12px] z-40">
        <button
          onClick={onFinishSession}
          disabled={submitting}
          className="
            w-full h-[56px] rounded-xl
            bg-secondary text-on-secondary
            font-[700] text-label-bold
            shadow-[0_4px_12px_rgba(124,88,0,0.3)]
            active:scale-[0.98] transition-all
            disabled:opacity-50
            flex items-center justify-center gap-[8px]
          "
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-on-secondary/30 border-t-on-secondary rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">
                check_circle
              </span>
              Selesaikan Sesi ({totalBatch} resep)
            </>
          )}
        </button>
      </div>

      {/* Desktop: Fixed bottom bar */}
      <div className="hidden md:flex fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t-2 border-surface-variant p-4 items-center justify-between shadow-[0_-4px_12px_rgba(74,50,31,0.1)] z-40">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-[32px]">
          <div className="flex items-center gap-4">
            <span className="text-headline-md font-[700] text-on-surface">
              Total Produksi Sesi Ini:
            </span>
            <span className="text-display-lg font-[800] text-primary">
              {totalBatch}
            </span>
          </div>
          <button
            onClick={onFinishSession}
            disabled={submitting}
            className="
              bg-secondary text-on-secondary
              font-[700] text-label-bold
              px-8 py-4 rounded-xl
              shadow-soft-press
              hover:bg-secondary-container transition-colors
              active:scale-95
              disabled:opacity-50
              flex items-center gap-[8px]
            "
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-on-secondary/30 border-t-on-secondary rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                Selesaikan Sesi
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
