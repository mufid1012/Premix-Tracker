import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNavBar from "@/components/layout/BottomNavBar";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Produksi Dapur — Tracking Premix",
  description:
    "Aplikasi pencatatan, pelacakan, dan analisis produksi adonan warung modern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background font-sans">
        {/* Shared TopAppBar */}
        <TopAppBar />

        {/* Page Content */}
        <main className="flex-1 pb-24 md:pb-0">{children}</main>

        {/* Shared BottomNavBar (mobile only) */}
        <BottomNavBar />
      </body>
    </html>
  );
}
