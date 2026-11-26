"use client";

import { useState } from "react";

interface TopItem {
  name: string;
  value: number;
  unit: string;
  percentage: number;
}

interface TopProgressBarProps {
  title: string;
  items: TopItem[];
}

export default function TopProgressBar({ title, items }: TopProgressBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemsToShow = isExpanded ? items : items.slice(0, 3);

  return (
    <section className="bg-white flex flex-col">
      <h2 className="band">{title}</h2>

      <div className="p-5 space-y-5 flex-1">
        {items.length === 0 ? (
          <p className="text-ink-soft text-center py-2">Belum ada data di periode ini.</p>
        ) : (
          itemsToShow.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between gap-4">
                <span>{item.name}</span>
                <span className="font-mono text-[14px] shrink-0">
                  {item.value} {item.unit}
                </span>
              </div>
              <div className="h-2 w-full bg-paper">
                <div className="h-full bg-band" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 3 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="btn w-full border-t border-line hover:bg-paper"
        >
          {isExpanded ? "Sembunyikan" : `Lihat Semua (${items.length})`}
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            {isExpanded ? "expand_less" : "expand_more"}
          </span>
        </button>
      )}
    </section>
  );
}
