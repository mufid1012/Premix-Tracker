"use client";

interface CategoryFilterProps {
  categories: Array<{ id: number; name: string; icon: string | null }>;
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({
  categories,
  activeId,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex overflow-x-auto pb-[12px] mb-[20px] gap-[12px] no-scrollbar scroll-smooth">
      {/* "Semua" tab */}
      <button
        onClick={() => onSelect("all")}
        className={`
          shrink-0 h-[56px] px-[20px] rounded-full
          font-[700] text-label-bold
          transition-all active:scale-95
          ${
            activeId === "all"
              ? "bg-secondary-container text-on-secondary-container shadow-[0_2px_4px_rgba(74,50,31,0.1)]"
              : "bg-surface-container-high text-on-surface-variant border border-outline-variant hover:bg-surface-variant"
          }
        `}
      >
        Semua
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(String(cat.id))}
          className={`
            shrink-0 h-[56px] px-[20px] rounded-full
            font-[700] text-label-bold
            transition-all active:scale-95
            ${
              activeId === String(cat.id)
                ? "bg-secondary-container text-on-secondary-container shadow-[0_2px_4px_rgba(74,50,31,0.1)]"
                : "bg-surface-container-high text-on-surface-variant border border-outline-variant hover:bg-surface-variant"
            }
          `}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
