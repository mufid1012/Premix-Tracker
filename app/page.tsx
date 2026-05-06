"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MetricCard from "@/components/dashboard/MetricCard";
import TrendChart from "@/components/dashboard/TrendChart";

interface DashboardData {
  totalBatchToday: number;
  batchTrend: number;
  totalBahanToday: number;
  bahanTrend: number;
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
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-[20px] md:p-[32px] max-w-4xl mx-auto space-y-[32px]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[20px]">
        <div>
          <h2 className="text-headline-md font-[700] text-on-surface mb-[4px]">
            Ringkasan Hari Ini
          </h2>
          <p className="text-body-md font-[400] text-on-surface-variant">
            Pantau produksi dan bahan baku.
          </p>
        </div>
        <Link
          href="/input"
          className="
            bg-primary text-on-primary
            font-[700] text-label-bold
            px-[32px] py-[12px] rounded-lg
            active-press
            flex items-center justify-center gap-[8px]
            min-h-[56px] w-full md:w-auto
            shadow-soft-press
            transition-transform
          "
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          Input Cepat
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-[48px]">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="mt-[12px] text-body-md text-on-surface-variant">
            Memuat data...
          </p>
        </div>
      )}

      {/* Bento Grid Metrics */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] stagger-children">
            <MetricCard
              title="Total Resep Hari Ini"
              value={data.totalBatchToday}
              unit="resep"
              trend={data.batchTrend}
              icon="restaurant"
              variant="primary"
            />
            <MetricCard
              title="Total Bahan Baku Terpakai"
              value={data.totalBahanToday}
              unit="kg"
              trend={data.bahanTrend}
              icon="kitchen"
              variant="secondary"
            />
          </div>

          {/* Trend Chart */}
          <div className="animate-slide-up">
            <TrendChart data={data.weeklyTrend} />
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && data && data.totalBatchToday === 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[32px] shadow-soft-press text-center">
          <span
            className="material-symbols-outlined text-[48px] text-outline mb-[12px]"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            restaurant
          </span>
          <p className="text-body-lg font-[500] text-on-surface mb-[4px]">
            Belum ada produksi hari ini
          </p>
          <p className="text-body-md text-on-surface-variant mb-[20px]">
            Mulai catat resep produksi pertama Anda.
          </p>
          <Link
            href="/input"
            className="
              inline-flex items-center gap-[8px]
              bg-primary text-on-primary
              font-[700] text-label-bold
              px-[24px] py-[12px] rounded-lg
              active-press shadow-soft-press
            "
          >
            <span className="material-symbols-outlined">add</span>
            Mulai Produksi
          </Link>
        </div>
      )}
    </div>
  );
}
