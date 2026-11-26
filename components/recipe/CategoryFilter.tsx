"use client";

interface CategoryFilterProps {
  categories: Array<{ id: number; name: string }>;
  activeId: string;
  onSelect: (id: string) => void;
}

/** Baris chip kategori. Dipakai di halaman Input dan Resep. */
export default function CategoryFilter({
  categories,
  activeId,
  onSelect,
}: CategoryFilterProps) {
  const options = [{ id: "all", name: "Semua" }, ...categories.map((c) => ({ id: String(c.id), name: c.name }))];

  return (
    <div
      role="group"
      aria-label="Filter kategori"
      className="flex overflow-x-auto no-scrollbar gap-2"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          aria-pressed={activeId === opt.id}
          className="chip"
        >
          {opt.name}
        </button>
      ))}
    </div>
  );
}
