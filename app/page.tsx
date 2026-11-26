"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MetricCard from "@/components/dashboard/MetricCard";
import TrendChart from "@/components/dashboard/TrendChart";
import { SPOON_ESTIMATE_NOTE } from "@/lib/units";

interface DashboardData {
  totalBatchToday: number;
  batchTrend: number;
  totalBahanToday: number;
  weeklyTrend: Array<{
    day: string;
    value: number;
    isPeak: boolean;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="row">
        <div className="frame px-4 py-12 md:py-20 text-center">
          <h1 className="h-display">Ringkasan Hari Ini</h1>
          <p className="mt-4 text-[16px] text-ink-soft">
            Pantau produksi dan bahan baku yang terpakai hari ini.
          </p>
          <Link href="/input" className="btn btn-dark mt-8 w-full sm:w-auto">
            <span aria-hidden="true" className="material-symbols-outlined">
              add
            </span>
            Input Produksi
          </Link>
        </div>
      </section>

      {loading && (
        <section className="row">
          <p role="status" className="frame px-4 py-12 text-center label-mono">
            Memuat data...
          </p>
        </section>
      )}

      {!loading && !data && (
        <section className="row">
          <p role="alert" className="frame px-4 py-12 text-center text-danger">
            Gagal memuat data dashboard. Muat ulang halaman untuk mencoba lagi.
          </p>
        </section>
      )}

      {data && (
        <>
          <section className="row" aria-label="Angka hari ini">
            <div className="frame grid grid-cols-1 sm:grid-cols-2 gap-px bg-line">
              <MetricCard
                title="Total resep hari ini"
                value={data.totalBatchToday}
                unit="resep"
                trend={data.batchTrend}
              />
              <MetricCard
                title="Bahan baku terpakai"
                value={data.totalBahanToday}
                unit="kg"
                note={SPOON_ESTIMATE_NOTE}
              />
            </div>
          </section>

          {data.totalBatchToday === 0 && (
            <section className="row">
              <div className="frame px-4 py-10 text-center">
                <p className="text-[18px] font-semibold">Belum ada produksi hari ini</p>
                <p className="mt-1 text-ink-soft">
                  Catat resep pertama yang selesai diolah hari ini.
                </p>
                <Link href="/input" className="btn btn-line mt-6">
                  Mulai Mencatat
                </Link>
              </div>
            </section>
          )}

          <section className="row">
            <div className="frame">
              <h2 className="bg-white px-4 md:px-6 pt-5 text-[18px] font-semibold">
                Tren penggunaan bahan, 7 hari
              </h2>
              <TrendChart data={data.weeklyTrend} />
            </div>
          </section>
        </>
      )}
    </>
  );
}
