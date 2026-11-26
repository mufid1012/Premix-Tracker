import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Tektur } from "next/font/google";
// Font ikon disajikan dari server aplikasi sendiri (paket npm), jadi tetap tampil
// walaupun internet warung putus. Font teks juga sudah lokal lewat next/font.
import "material-symbols/outlined.css";
import "./globals.css";
import TopAppBar from "@/components/layout/TopAppBar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import PinProvider from "@/components/PinProvider";

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
  appleWebApp: { capable: true, title: "Produksi", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  themeColor: "#242628",
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
      <body className="min-h-full flex flex-col">
        <TopAppBar />

        <main className="flex-1 flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <PinProvider>{children}</PinProvider>
          {/* Garis bingkai diteruskan sampai dasar layar */}
          <div aria-hidden="true" className="frame grow min-h-8" />
        </main>

        <BottomNavBar />
      </body>
    </html>
  );
}
