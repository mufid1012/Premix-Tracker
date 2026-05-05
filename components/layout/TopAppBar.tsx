"use client";

import { useRouter } from "next/navigation";

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
}

export default function TopAppBar({
  title = "Produksi Dapur",
  showBack = false,
}: TopAppBarProps) {
  const router = useRouter();

  return (
    <header
      className="
        bg-stone-50 sticky top-0 z-40
        border-b-2 border-stone-200
        shadow-[0_2px_4px_rgba(74,50,31,0.05)]
        flex items-center justify-between
        px-6 h-16 w-full
      "
    >
      {/* Left: Back button or spacer */}
      {showBack ? (
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="
            flex items-center justify-center
            w-[56px] h-[56px]
            text-emerald-800
            rounded-full
            hover:bg-stone-200/50
            active:scale-95 active:bg-stone-200
            transition-colors duration-150
          "
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            arrow_back
          </span>
        </button>
      ) : (
        <div className="w-[56px]" />
      )}

      {/* Center: Title */}
      <h1 className="text-xl font-black text-emerald-900 text-center flex-1">
        {title}
      </h1>

      {/* Right: Profile */}
      <button
        aria-label="Profile"
        className="
          flex items-center justify-center
          w-[56px] h-[56px]
          text-emerald-800
          rounded-full
          hover:bg-stone-200/50
          active:scale-95 active:bg-stone-200
          transition-colors duration-150
        "
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          account_circle
        </span>
      </button>
    </header>
  );
}
