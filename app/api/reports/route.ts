import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeToKg, round1 } from "@/lib/units";
import { periodRange, type Period } from "@/lib/reportPeriod";

const PERIODS: Period[] = ["harian", "mingguan", "bulanan"];
const MAX_OFFSET = 520; // sekitar 10 tahun mingguan; cukup untuk menelusuri ke belakang

// GET /api/reports?period=harian|mingguan|bulanan&offset=0 (0 = periode berjalan)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const periodParam = searchParams.get("period") as Period;
    const period = PERIODS.includes(periodParam) ? periodParam : "harian";
    const offsetParam = Number(searchParams.get("offset") ?? 0);
    const offset = Number.isInteger(offsetParam) ? Math.min(Math.max(offsetParam, 0), MAX_OFFSET) : 0;

    const range = periodRange(period, offset);
    const trendStart = range.buckets[0].start;
    const trendEnd = range.buckets[range.buckets.length - 1].end;

    // Satu kueri mencakup rentang ringkasan dan rentang grafik tren
    const entries = await prisma.productionEntry.findMany({
      where: {
        createdAt: {
          gte: trendStart < range.start ? trendStart : range.start,
          lt: trendEnd > range.end ? trendEnd : range.end,
        },
      },
      include: { ingredients: true },
    });

    let totalBatch = 0;
    let totalBahanKg = 0;
    const recipeMap = new Map<string, number>();
    const ingredientMap = new Map<string, number>();
    const trendValues = range.buckets.map(() => 0);

    for (const entry of entries) {
      const bucketIdx = range.buckets.findIndex(
        (b) => entry.createdAt >= b.start && entry.createdAt < b.end
      );
      if (bucketIdx >= 0) trendValues[bucketIdx] += entry.batchCount;

      if (entry.createdAt < range.start || entry.createdAt >= range.end) continue;

      totalBatch += entry.batchCount;
      const recipeName = entry.recipeName.trim();
      recipeMap.set(recipeName, (recipeMap.get(recipeName) || 0) + entry.batchCount);

      for (const ing of entry.ingredients) {
        const usedKg = entry.batchCount * normalizeToKg(ing.quantity, ing.unit);
        totalBahanKg += usedKg;
        // trim: "Moto " dan "Moto" dihitung satu bahan
        const name = ing.ingredientName.trim();
        ingredientMap.set(name, (ingredientMap.get(name) || 0) + usedKg);
      }
    }

    const ranked = (map: Map<string, number>, unit: string, round: (v: number) => number) => {
      const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
      const max = sorted[0]?.[1] || 1;
      return sorted.map(([name, v]) => ({
        name,
        value: round(v),
        unit,
        percentage: Math.round((v / max) * 100) || 0,
      }));
    };

    const maxTrend = Math.max(...trendValues);

    return NextResponse.json({
      offset,
      dateRange: range.dateRange,
      summary: {
        totalBatch,
        totalBahanKg: round1(totalBahanKg),
      },
      topRecipes: ranked(recipeMap, "Resep", (v) => v),
      topIngredients: ranked(ingredientMap, "kg", round1),
      trendData: range.buckets.map((b, i) => ({
        label: b.label,
        value: trendValues[i],
        isPeak: maxTrend > 0 && trendValues[i] === maxTrend,
      })),
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Gagal memuat data laporan" }, { status: 500 });
  }
}
