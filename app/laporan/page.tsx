"use client";

import { useEffect, useState } from "react";
import PeriodSelector from "@/components/report/PeriodSelector";
import MetricCard from "@/components/dashboard/MetricCard";
import TopProgressBar from "@/components/report/TopProgressBar";
import SimpleBarChart from "@/components/report/SimpleBarChart";
import PrintReport, { fmtNumber, type ReportSection } from "@/components/report/PrintReport";
import { SPOON_ESTIMATE_NOTE } from "@/lib/units";
import { offsetForDate, rangeEndValue } from "@/lib/reportPeriod";

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
  // 0 = periode berjalan, 1 = sebelumnya, dst.
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<ReportData | null>(null);
  // Kunci periode yang datanya sedang tampil; beda dengan kunci aktif berarti sedang memuat
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const key = `${period}:${offset}`;
  const loading = loadedKey !== key;

  const changePeriod = (p: Period) => {
    setPeriod(p);
    setOffset(0);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/reports?period=${period}&offset=${offset}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((json) => {
        if (controller.signal.aborted) return;
        setData(json);
        setLoadedKey(`${period}:${offset}`);
      });
    return () => controller.abort();
  }, [period, offset]);

  const periodNoun = { harian: "hari", mingguan: "minggu", bulanan: "bulan" }[period];

  const periodLabel = { harian: "Harian", mingguan: "Mingguan", bulanan: "Bulanan" }[period];

  const sections: ReportSection[] = data
    ? [
        {
          title: "Resep terbanyak",
          nameHeader: "Nama resep",
          unit: "resep",
          rows: data.topRecipes,
        },
        {
          title: "Bahan terpakai",
          nameHeader: "Nama bahan",
          unit: "kg",
          rows: data.topIngredients,
        },
        {
          title: "Tren produksi",
          nameHeader: "Periode",
          unit: "resep",
          rows: data.trendData.map((t) => ({ name: t.label, value: t.value })),
        },
      ]
    : [];

  const fileName = data
    ? `laporan_produksi_${period}_${data.dateRange.replace(/[^0-9A-Za-z]+/g, "-")}`
    : "";

  // Excel berlocale Indonesia memakai ";" sebagai pemisah kolom dan "," sebagai desimal
  const handleDownloadCsv = () => {
    if (!data) return;
    const cell = (v: string | number) =>
      typeof v === "number" ? fmtNumber(v) : `"${v.replace(/"/g, '""')}"`;
    const row = (...cells: Array<string | number>) => cells.map(cell).join(";");

    const lines = [
      row("Laporan Produksi"),
      row("Periode", periodLabel),
      row("Rentang", data.dateRange),
      "",
      row("Ringkasan", "Jumlah", "Satuan"),
      row("Adonan selesai", data.summary.totalBatch, "resep"),
      row("Bahan terpakai", data.summary.totalBahanKg, "kg"),
    ];
    for (const s of sections) {
      lines.push("", row(s.title), row("No", s.nameHeader, `Jumlah (${s.unit})`));
      s.rows.forEach((r, i) => lines.push(row(i + 1, r.name, r.value)));
    }
    lines.push("", row(SPOON_ESTIMATE_NOTE));

    // BOM supaya Excel membaca huruf non-ASCII dengan benar
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Judul dokumen jadi nama file bawaan saat "Simpan sebagai PDF"
  const handleDownloadPdf = () => {
    const prev = document.title;
    document.title = fileName;
    window.print();
    document.title = prev;
  };

  return (
    <>
      <section className="row">
        <div className="frame px-4 py-8 md:py-12 text-center">
          <h1 className="h-display">Laporan Produksi</h1>
          <p className="mt-3 text-ink-soft">Ringkasan produksi dan pemakaian bahan.</p>
        </div>
      </section>

      <section className="row">
        <div className="frame">
          <h2 className="band">Periode</h2>
          <PeriodSelector period={period} onChange={changePeriod} />
          <div className="flex items-stretch border-t border-line bg-white">
            <button
              type="button"
              onClick={() => setOffset((o) => o + 1)}
              disabled={loading}
              aria-label={`${periodNoun} sebelumnya`}
              className="btn btn-icon h-14 w-14 border-r border-line hover:bg-paper"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                chevron_left
              </span>
            </button>
            {/* Input tanggal transparan menutupi label: ketuk tanggal untuk membuka kalender HP */}
            <label className="relative flex-1 flex flex-col items-center justify-center px-2 text-center cursor-pointer hover:bg-paper">
              <span aria-live="polite" className="flex items-center gap-1 font-semibold">
                {data?.dateRange ?? "..."}
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  calendar_month
                </span>
              </span>
              <span className="label-mono text-[11px]">
                {offset === 0 ? `${periodNoun} ini` : `${offset} ${periodNoun} lalu`}
              </span>
              <input
                type="date"
                aria-label="Pilih tanggal laporan"
                value={data ? rangeEndValue(period, offset) : ""}
                max={data ? rangeEndValue(period, 0) : undefined}
                onClick={(e) => e.currentTarget.showPicker?.()}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  setOffset(offsetForDate(period, new Date(y, m - 1, d)));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
            <button
              type="button"
              onClick={() => setOffset((o) => Math.max(o - 1, 0))}
              disabled={loading || offset === 0}
              aria-label={`${periodNoun} berikutnya`}
              className="btn btn-icon h-14 w-14 border-l border-line hover:bg-paper"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                chevron_right
              </span>
            </button>
          </div>
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
            <div className="frame grid grid-cols-2 gap-3 p-4">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="btn btn-dark min-h-14 px-3 whitespace-nowrap"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  picture_as_pdf
                </span>
                Unduh PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="btn btn-line min-h-14 px-3 whitespace-nowrap"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  table_view
                </span>
                Unduh CSV
              </button>
            </div>
          </section>

          <PrintReport
            periodLabel={periodLabel}
            dateRange={data.dateRange}
            totalBatch={data.summary.totalBatch}
            totalBahanKg={data.summary.totalBahanKg}
            sections={sections}
          />
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
