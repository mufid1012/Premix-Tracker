export default function InputPage() {
  return (
    <div className="p-[20px] md:p-[32px] max-w-7xl mx-auto">
      <div className="mb-[32px] pt-[32px]">
        <h1 className="text-display-lg font-[800] tracking-[-0.02em] text-on-surface mb-[4px]">
          Input Produksi
        </h1>
        <p className="text-body-md font-[400] text-on-surface-variant">
          Catat jumlah batch produksi harian.
        </p>
      </div>

      {/* Placeholder content */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[20px] shadow-soft-press text-center">
        <p className="text-body-lg font-[500] text-on-surface-variant">
          🍳 Input Produksi akan diisi di Phase 5
        </p>
      </div>
    </div>
  );
}
