export default function DashboardPage() {
  return (
    <div className="p-[20px] md:p-[32px] max-w-4xl mx-auto space-y-[32px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[20px]">
        <div>
          <h2 className="text-headline-md font-[700] text-on-surface mb-[4px]">
            Ringkasan Hari Ini
          </h2>
          <p className="text-body-md font-[400] text-on-surface-variant">
            Pantau produksi dan bahan baku.
          </p>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[20px] shadow-soft-press text-center">
        <p className="text-body-lg font-[500] text-on-surface-variant">
          📊 Dashboard akan diisi di Phase 3
        </p>
      </div>
    </div>
  );
}
