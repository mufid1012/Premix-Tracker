"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/resep", label: "Resep", icon: "restaurant_menu" },
  { href: "/input", label: "Input", icon: "add_task" },
  { href: "/laporan", label: "Laporan", icon: "analytics" },
];

/** Navigasi utama di ponsel. Desktop memakai tautan di TopAppBar. */
export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-line grid grid-cols-4 pb-[env(safe-area-inset-bottom)]"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`h-16 flex flex-col items-center justify-center gap-0.5 border-l border-line first:border-l-0 font-mono text-[11px] uppercase transition-colors ${
              isActive
                ? "bg-band text-white"
                : "text-ink hover:bg-paper active:bg-panel"
            }`}
          >
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
