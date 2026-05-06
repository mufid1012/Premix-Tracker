import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "harian"; // harian, mingguan, bulanan

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let startDate = new Date(today);
    let endDate = new Date(tomorrow);

    if (period === "mingguan") {
      startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      // If we want last 7 days including today instead of calendar week:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    } else if (period === "bulanan") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1); // Start of next month
    }

    // Fetch entries within the period
    const entries = await prisma.productionEntry.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
      },
      include: {
        recipe: {
          include: { ingredients: true },
        },
      },
    });

    let totalBatch = 0;
    let totalBahanKg = 0;
    const recipeMap = new Map<string, number>();
    const ingredientMap = new Map<string, number>();

    // Trend grouping setup
    // For harian/mingguan: group by day. For bulanan: group by week/day.
    // Let's keep it simple: array of data points
    const trendMap = new Map<string, number>();
    
    // Initialize trend map based on period
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    if (period === "harian") {
      // Just today, maybe show hours? Or just today vs yesterday. The mockup shows days of week for "Tren Produksi"
      // So let's always return the last 7 days of trend data for 'harian' and 'mingguan' to match the mockup
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        trendMap.set(dayNames[d.getDay()], 0);
      }
    } else if (period === "mingguan") {
       for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        trendMap.set(dayNames[d.getDay()], 0);
      }
    } else if (period === "bulanan") {
      // 4 weeks of the month
      trendMap.set("Minggu 1", 0);
      trendMap.set("Minggu 2", 0);
      trendMap.set("Minggu 3", 0);
      trendMap.set("Minggu 4", 0);
    }

    for (const entry of entries) {
      totalBatch += entry.batchCount;

      // Recipe aggregation
      const rName = entry.recipe.name;
      recipeMap.set(rName, (recipeMap.get(rName) || 0) + entry.batchCount);

      // Trend aggregation
      if (period === "harian" || period === "mingguan") {
        const entryDay = dayNames[entry.createdAt.getDay()];
        if (trendMap.has(entryDay)) {
          trendMap.set(entryDay, trendMap.get(entryDay)! + entry.batchCount);
        }
      } else {
        const weekNum = Math.ceil(entry.createdAt.getDate() / 7);
        const wKey = `Minggu ${weekNum > 4 ? 4 : weekNum}`;
        if (trendMap.has(wKey)) {
          trendMap.set(wKey, trendMap.get(wKey)! + entry.batchCount);
        }
      }

      // Ingredients aggregation
      for (const ing of entry.recipe.ingredients) {
        const qtyInKg = normalizeToKg(ing.quantity, ing.unit);
        const usedKg = entry.batchCount * qtyInKg;
        totalBahanKg += usedKg;

        const iName = ing.ingredientName;
        ingredientMap.set(iName, (ingredientMap.get(iName) || 0) + usedKg);
      }
    }

    // Format top recipes
    const sortedRecipes = Array.from(recipeMap.entries())
      .sort((a, b) => b[1] - a[1]);
    const maxRecipeBatch = sortedRecipes.length > 0 ? sortedRecipes[0][1] : 1;
    const topRecipes = sortedRecipes.map(([name, batches]) => ({
      name,
      value: batches,
      unit: "Batch",
      percentage: Math.round((batches / maxRecipeBatch) * 100) || 0,
    }));

    // Format top ingredients
    const sortedIngredients = Array.from(ingredientMap.entries())
      .sort((a, b) => b[1] - a[1]);
    const maxIngredientKg = sortedIngredients.length > 0 ? sortedIngredients[0][1] : 1;
    const topIngredients = sortedIngredients.map(([name, kg]) => ({
      name,
      value: Math.round(kg * 10) / 10,
      unit: "kg",
      percentage: Math.round((kg / maxIngredientKg) * 100) || 0,
    }));

    // Format trend data
    const trendDataRaw = Array.from(trendMap.entries()).map(([label, value]) => ({
      label,
      value,
      isPeak: false,
    }));
    const maxTrendValue = Math.max(...trendDataRaw.map((d) => d.value));
    const trendData = trendDataRaw.map((d) => ({
      ...d,
      isPeak: maxTrendValue > 0 && d.value === maxTrendValue,
    }));

    return NextResponse.json({
      summary: {
        totalBatch,
        totalBahanKg: Math.round(totalBahanKg * 10) / 10,
      },
      topRecipes,
      topIngredients,
      trendData,
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data laporan" },
      { status: 500 }
    );
  }
}

function normalizeToKg(quantity: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u === "kg" || u === "liter" || u === "l") return quantity;
  return quantity / 1000;
}
