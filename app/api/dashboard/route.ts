import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // --- Total Batch Hari Ini ---
    const todayEntries = await prisma.productionEntry.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
      include: {
        recipe: {
          include: { ingredients: true },
        },
      },
    });

    const totalBatchToday = todayEntries.reduce(
      (sum, e) => sum + e.batchCount,
      0
    );

    // --- Total Batch Kemarin (untuk trend) ---
    const yesterdayEntries = await prisma.productionEntry.findMany({
      where: {
        createdAt: { gte: yesterday, lt: today },
      },
    });

    const totalBatchYesterday = yesterdayEntries.reduce(
      (sum, e) => sum + e.batchCount,
      0
    );

    const batchTrend =
      totalBatchYesterday > 0
        ? Math.round(
            ((totalBatchToday - totalBatchYesterday) / totalBatchYesterday) * 100
          )
        : totalBatchToday > 0
          ? 100
          : 0;

    // --- Total Bahan Terpakai Hari Ini ---
    // Kalkulasi: batch_count × ingredient.quantity (normalisasi ke Kg)
    let totalBahanKg = 0;
    for (const entry of todayEntries) {
      for (const ing of entry.recipe.ingredients) {
        const qtyInKg = normalizeToKg(ing.quantity, ing.unit);
        totalBahanKg += entry.batchCount * qtyInKg;
      }
    }
    totalBahanKg = Math.round(totalBahanKg * 10) / 10; // 1 decimal

    // --- Tren Mingguan (7 hari terakhir) ---
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const weeklyTrend = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayEntries = await prisma.productionEntry.findMany({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
        },
        include: {
          recipe: { include: { ingredients: true } },
        },
      });

      let dayBahan = 0;
      for (const entry of dayEntries) {
        for (const ing of entry.recipe.ingredients) {
          dayBahan += entry.batchCount * normalizeToKg(ing.quantity, ing.unit);
        }
      }

      weeklyTrend.push({
        day: dayNames[dayStart.getDay()],
        value: Math.round(dayBahan * 10) / 10,
        isPeak: false, // will be set below
      });
    }

    // Mark the peak day
    const maxValue = Math.max(...weeklyTrend.map((d) => d.value));
    if (maxValue > 0) {
      for (const d of weeklyTrend) {
        if (d.value === maxValue) d.isPeak = true;
      }
    }

    return NextResponse.json({
      totalBatchToday,
      batchTrend,
      totalBahanToday: totalBahanKg,
      bahanTrend: batchTrend, // simplified: use same trend
      weeklyTrend,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data dashboard" },
      { status: 500 }
    );
  }
}

/** Normalize quantity to Kg */
function normalizeToKg(quantity: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u === "kg") return quantity;
  if (u === "gr" || u === "gram" || u === "g") return quantity / 1000;
  if (u === "ml" || u === "liter" || u === "l") return quantity / 1000;
  return quantity / 1000; // default: treat as grams
}
