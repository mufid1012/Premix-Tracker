"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./BottomNavBar";

export default function TopAppBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-line">
      <div className="frame h-16 flex items-stretch justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 md:px-6 font-display text-[20px] uppercase tracking-[0.02em] hover:text-ink-soft"
        >
          {/* rounded-full memotong sudut putih file JPG */}
          <Image
            src="/logo.jpg"
            alt="Logo warung"
            width={44}
            height={44}
            priority
            className="rounded-full"
          />
          Produksi Dapur
        </Link>

        <nav aria-label="Navigasi utama" className="hidden md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center px-5 border-l border-line font-mono text-[13px] uppercase transition-colors ${
                  isActive ? "bg-band text-white" : "text-ink hover:bg-paper active:bg-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
