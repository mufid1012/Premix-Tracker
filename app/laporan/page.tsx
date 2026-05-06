"use client";

import { useEffect, useState } from "react";
import PeriodSelector from "@/components/report/PeriodSelector";
import StatCard from "@/components/report/StatCard";
import TopProgressBar from "@/components/report/TopProgressBar";
import SimpleBarChart from "@/components/report/SimpleBarChart";

type Period = "harian" | "mingguan" | "bulanan";

interface ReportData {
  dateRange: string;
  summary: {
    totalBatch: number;
    totalBahanKg: number;
  };
  topRecipes: Array<{ name: string; value: number; unit: string; percentage: number }>;
  topIngredients: Array<{ name: string; value: number; unit: string; percentage: number }>;
  trendData: Array<{ label: string; value: number; isPeak: boolean }>;
}

export default function LaporanPage() {
  const [period, setPeriod] = useState<Period>("mingguan");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?period=${period}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const handleDownload = () => {
    if (!data) return;

    // Build CSV content
    const lines = [];
    lines.push(`Laporan Produksi - Periode: ${period.toUpperCase()}`);
    lines.push("");

    lines.push("RINGKASAN");
    lines.push(`Total Adonan Selesai,${data.summary.totalBatch} Batch`);
    lines.push(`Total Bahan Terpakai,${data.summary.totalBahanKg} Kg`);
    lines.push("");

    lines.push("TOP RESEP");
    lines.push("Nama Resep,Jumlah (Batch)");
    data.topRecipes.forEach((r) => lines.push(`"${r.name}",${r.value}`));
    lines.push("");

    lines.push("TOP BAHAN TERPAKAI");
    lines.push("Nama Bahan,Jumlah (Kg)");
    data.topIngredients.forEach((i) => lines.push(`"${i.name}",${i.value}`));
    lines.push("");

    lines.push("TREN PRODUKSI");
    lines.push("Periode,Jumlah (Batch)");
    data.trendData.forEach((t) => lines.push(`${t.label},${t.value}`));

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_produksi_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-[20px] md:p-[32px] max-w-4xl mx-auto space-y-[24px] pb-[100px]">
      {/* Header */}
      <div className="mb-[32px] pt-[12px] md:pt-[32px]">
        <h1 className="text-display-lg font-[800] tracking-[-0.02em] text-on-surface mb-[4px]">
          Laporan Produksi
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-body-md font-[400] text-on-surface-variant">
            Ringkasan performa dan pemakaian bahan.
          </p>
          {data && (
            <p className="text-label-bold font-[700] text-primary bg-primary-container px-3 py-1 rounded-full w-fit">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">calendar_today</span>
              {data.dateRange}
            </p>
          )}
        </div>
      </div>

      <PeriodSelector period={period} onChange={setPeriod} />

      {loading ? (
        <div className="text-center py-[48px]">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="mt-[12px] text-body-md text-on-surface-variant">
            Memuat laporan...
          </p>
        </div>
      ) : data ? (
        <div className="animate-slide-up space-y-[24px]">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-[16px]">
            <StatCard
              title="Adonan Selesai"
              value={data.summary.totalBatch}
              unit="Batch"
              icon="restaurant_menu"
            />
            <StatCard
              title="Bahan Terpakai"
              value={data.summary.totalBahanKg}
              unit="kg"
              icon="inventory_2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {/* Top Resep */}
            <TopProgressBar
              title="Top Resep Terbanyak"
              icon="bar_chart"
              items={data.topRecipes}
            />

            {/* Top Bahan */}
            <TopProgressBar
              title="Top Bahan Terpakai"
              icon="inventory_2"
              items={data.topIngredients}
            />
          </div>

          {/* Tren Produksi */}
          <div className="md:w-1/2 md:mx-auto">
            <SimpleBarChart title="Tren Produksi" data={data.trendData} />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full bg-primary text-on-primary font-[700] text-headline-md py-[16px] rounded-xl flex items-center justify-center gap-[12px] active:scale-95 transition-all shadow-soft-press hover:bg-primary-container hover:text-on-primary-container"
          >
            <span className="material-symbols-outlined">download</span>
            Unduh Laporan (CSV)
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-on-surface-variant">
          Gagal memuat laporan.
        </div>
      )}
    </div>
  );
}
