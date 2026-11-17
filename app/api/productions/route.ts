import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeToKg } from "@/lib/units";

// POST /api/productions — Create a production session with entries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body as {
      entries: Array<{ recipeId: number; batchCount: number }>;
    };

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 entry produksi diperlukan" },
        { status: 400 }
      );
    }

    // Filter only entries with batchCount > 0
    const validEntries = entries.filter((e) => e.batchCount > 0);

    if (validEntries.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada batch yang dicatat" },
        { status: 400 }
      );
    }

    const recipes = await prisma.recipe.findMany({
      where: { id: { in: validEntries.map((e) => e.recipeId) } },
      include: { ingredients: true },
    });
    const recipeById = new Map(recipes.map((r) => [r.id, r]));

    if (validEntries.some((e) => !recipeById.has(e.recipeId))) {
      return NextResponse.json(
        { error: "Resep tidak ditemukan" },
        { status: 400 }
      );
    }

    // Nama dan komposisi resep disalin ke entry (snapshot), supaya laporan
    // lama tidak berubah saat resep diedit atau dihapus.
    const session = await prisma.productionSession.create({
      data: {
        status: "completed",
        completedAt: new Date(),
        entries: {
          create: validEntries.map((e) => {
            const recipe = recipeById.get(e.recipeId)!;
            return {
              recipeId: recipe.id,
              recipeName: recipe.name,
              batchCount: e.batchCount,
              ingredients: {
                create: recipe.ingredients.map((ing) => ({
                  ingredientName: ing.ingredientName,
                  quantity: ing.quantity,
                  unit: ing.unit,
                })),
              },
            };
          }),
        },
      },
      include: {
        entries: { include: { ingredients: true } },
      },
    });

    // Calculate total ingredients used
    let totalBahanKg = 0;
    for (const entry of session.entries) {
      for (const ing of entry.ingredients) {
        totalBahanKg += entry.batchCount * normalizeToKg(ing.quantity, ing.unit);
      }
    }

    const totalBatch = session.entries.reduce(
      (sum, e) => sum + e.batchCount,
      0
    );

    return NextResponse.json(
      {
        sessionId: session.id,
        totalBatch,
        totalBahanKg: Math.round(totalBahanKg * 10) / 10,
        entryCount: session.entries.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Productions POST error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan produksi" },
      { status: 500 }
    );
  }
}

// GET /api/productions — Get recent production sessions
export async function GET() {
  try {
    const sessions = await prisma.productionSession.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        entries: {
          include: {
            recipe: true,
          },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Productions GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data produksi" },
      { status: 500 }
    );
  }
}
