import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Tektur } from "next/font/google";
import "./globals.css";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNavBar from "@/components/layout/BottomNavBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const tektur = Tektur({
  variable: "--font-tektur",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Produksi Dapur | Tracking Premix",
  description:
    "Aplikasi pencatatan, pelacakan, dan analisis produksi adonan warung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${tektur.variable} ${jetbrains.variable} h-full`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TopAppBar />

        <main className="flex-1 flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
          {/* Garis bingkai diteruskan sampai dasar layar */}
          <div aria-hidden="true" className="frame grow min-h-8" />
        </main>

        <BottomNavBar />
      </body>
    </html>
  );
}
