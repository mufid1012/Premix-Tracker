"use client";

import { useEffect, useState } from "react";
import PeriodSelector from "@/components/report/PeriodSelector";
import MetricCard from "@/components/dashboard/MetricCard";
import TopProgressBar from "@/components/report/TopProgressBar";
import SimpleBarChart from "@/components/report/SimpleBarChart";
import { SPOON_ESTIMATE_NOTE } from "@/lib/units";

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
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const handleDownload = () => {
    if (!data) return;

    const lines = [];
    lines.push(`Laporan Produksi - Periode: ${period.toUpperCase()} (${data.dateRange})`);
    lines.push("");

    lines.push("RINGKASAN");
    lines.push(`Total Adonan Selesai,${data.summary.totalBatch} Resep`);
    lines.push(`Total Bahan Terpakai,${data.summary.totalBahanKg} Kg`);
    lines.push("");

    lines.push("TOP RESEP");
    lines.push("Nama Resep,Jumlah (Resep)");
    data.topRecipes.forEach((r) => lines.push(`"${r.name}",${r.value}`));
    lines.push("");

    lines.push("TOP BAHAN TERPAKAI");
    lines.push("Nama Bahan,Jumlah (Kg)");
    data.topIngredients.forEach((i) => lines.push(`"${i.name}",${i.value}`));
    lines.push("");

    lines.push("TREN PRODUKSI");
    lines.push("Periode,Jumlah (Resep)");
    data.trendData.forEach((t) => lines.push(`${t.label},${t.value}`));

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_produksi_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="row">
        <div className="frame px-4 py-8 md:py-12 text-center">
          <h1 className="h-display">Laporan Produksi</h1>
          <p className="mt-3 text-ink-soft">Ringkasan produksi dan pemakaian bahan.</p>
          {data && (
            <p className="label-mono mt-4 flex items-center justify-center gap-1 text-ink">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                calendar_today
              </span>
              {data.dateRange}
            </p>
          )}
        </div>
      </section>

      <section className="row">
        <div className="frame">
          <h2 className="band">Periode</h2>
          <PeriodSelector period={period} onChange={setPeriod} />
        </div>
      </section>

      {loading ? (
        <section className="row">
          <p role="status" className="frame px-4 py-12 text-center label-mono">
            Memuat laporan...
          </p>
        </section>
      ) : data ? (
        <>
          <section className="row" aria-label="Ringkasan">
            <div className="frame grid grid-cols-2 gap-px bg-line">
              <MetricCard title="Adonan selesai" value={data.summary.totalBatch} unit="resep" />
              <MetricCard
                title="Bahan terpakai"
                value={data.summary.totalBahanKg}
                unit="kg"
                note={SPOON_ESTIMATE_NOTE}
              />
            </div>
          </section>

          <section className="row">
            <div className="frame grid grid-cols-1 md:grid-cols-2 gap-px bg-line">
              <TopProgressBar title="Resep terbanyak" items={data.topRecipes} />
              <TopProgressBar title="Bahan terpakai" items={data.topIngredients} />
            </div>
          </section>

          <section className="row">
            <div className="frame">
              <h2 className="band">Tren produksi (resep)</h2>
              <SimpleBarChart data={data.trendData} />
            </div>
          </section>

          <section className="row">
            <div className="frame p-4">
              <button type="button" onClick={handleDownload} className="btn btn-dark w-full min-h-14">
                <span aria-hidden="true" className="material-symbols-outlined">
                  download
                </span>
                Unduh Laporan (CSV)
              </button>
            </div>
          </section>
        </>
      ) : (
        <section className="row">
          <p role="alert" className="frame px-4 py-12 text-center text-danger">
            Gagal memuat laporan. Muat ulang halaman untuk mencoba lagi.
          </p>
        </section>
      )}
    </>
  );
}
