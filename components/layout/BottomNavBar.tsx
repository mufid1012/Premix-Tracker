"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/resep", label: "Resep", icon: "restaurant_menu" },
  { href: "/input", label: "Input", icon: "add_task" },
  { href: "/laporan", label: "Laporan", icon: "analytics" },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="
        md:hidden fixed bottom-0 left-0 w-full z-50
        bg-stone-50 rounded-t-2xl
        border-t-2 border-stone-200
        shadow-[0_-4px_12px_rgba(74,50,31,0.1)]
        h-20 flex justify-around items-center px-4 pb-[env(safe-area-inset-bottom)]
        font-[var(--font-plus-jakarta-sans)]
        text-[10px] font-extrabold uppercase tracking-widest
      "
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`
              flex flex-col items-center justify-center
              px-4 py-2 h-full
              transition-all duration-200
              active:translate-y-0.5
              ${
                isActive
                  ? "bg-emerald-100 text-emerald-900 rounded-xl min-w-[64px]"
                  : "text-stone-500 hover:text-emerald-700"
              }
            `}
          >
            <span
              className="material-symbols-outlined mb-1 text-2xl"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
