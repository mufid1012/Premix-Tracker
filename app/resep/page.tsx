export default function ResepPage() {
  return (
    <div className="p-[20px] max-w-5xl mx-auto">
      <div className="mb-[32px] pt-[32px]">
        <h1 className="text-display-lg font-[800] tracking-[-0.02em] text-on-surface mb-[4px]">
          Manajemen Resep
        </h1>
        <p className="text-body-md font-[400] text-on-surface-variant">
          Panduan proporsi standar untuk 1 batch produksi.
        </p>
      </div>

      {/* Placeholder content */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[20px] shadow-soft-press text-center">
        <p className="text-body-lg font-[500] text-on-surface-variant">
          📋 Daftar Resep akan diisi di Phase 4
        </p>
      </div>
    </div>
  );
}
