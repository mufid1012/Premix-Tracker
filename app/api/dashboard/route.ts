import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { entryKg, round1 } from "@/lib/units";
import { periodRange } from "@/lib/reportPeriod";

// GET /api/dashboard: angka hari ini dan tren bahan 7 hari terakhir
export async function GET() {
  try {
    // 7 batang harian yang berakhir hari ini; batang ke-6 adalah kemarin
    const { buckets } = periodRange("harian", 0);
    const today = buckets[6];
    const yesterday = buckets[5];

    const entries = await prisma.productionEntry.findMany({
      where: { createdAt: { gte: buckets[0].start, lt: today.end } },
      include: { ingredients: true },
    });

    const inBucket = (b: (typeof buckets)[number]) =>
      entries.filter((e) => e.createdAt >= b.start && e.createdAt < b.end);
    const batches = (list: typeof entries) => list.reduce((sum, e) => sum + e.batchCount, 0);
    const kg = (list: typeof entries) => list.reduce((sum, e) => sum + entryKg(e), 0);

    const todayEntries = inBucket(today);
    const totalBatchToday = batches(todayEntries);
    const totalBatchYesterday = batches(inBucket(yesterday));
    const batchTrend =
      totalBatchYesterday > 0
        ? Math.round(((totalBatchToday - totalBatchYesterday) / totalBatchYesterday) * 100)
        : totalBatchToday > 0
          ? 100
          : 0;

    const values = buckets.map((b) => round1(kg(inBucket(b))));
    const maxValue = Math.max(...values);

    return NextResponse.json({
      totalBatchToday,
      batchTrend,
      totalBahanToday: round1(kg(todayEntries)),
      weeklyTrend: buckets.map((b, i) => ({
        day: b.label,
        value: values[i],
        isPeak: maxValue > 0 && values[i] === maxValue,
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Gagal memuat data dashboard" }, { status: 500 });
  }
}
