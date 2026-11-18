import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { entryKg, round1 } from "@/lib/units";

const PAGE_SIZE = 20;

type EntryInput = { recipeId: number; batchCount: number };

const isValidEntry = (e: unknown): e is EntryInput =>
  typeof e === "object" &&
  e !== null &&
  Number.isInteger((e as EntryInput).recipeId) &&
  Number.isInteger((e as EntryInput).batchCount) &&
  (e as EntryInput).batchCount >= 0;

// POST /api/productions { entries: [{ recipeId, batchCount }] }: simpan satu sesi produksi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const entries: unknown[] = Array.isArray(body?.entries) ? body.entries : [];

    if (!entries.every(isValidEntry)) {
      return NextResponse.json({ error: "Data produksi tidak valid" }, { status: 400 });
    }
    const validEntries = (entries as EntryInput[]).filter((e) => e.batchCount > 0);
    if (validEntries.length === 0) {
      return NextResponse.json({ error: "Tidak ada resep yang dicatat" }, { status: 400 });
    }

    const recipes = await prisma.recipe.findMany({
      where: { id: { in: validEntries.map((e) => e.recipeId) } },
      include: { ingredients: true },
    });
    const recipeById = new Map(recipes.map((r) => [r.id, r]));
    if (validEntries.some((e) => !recipeById.has(e.recipeId))) {
      return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 400 });
    }

    // Nama dan komposisi resep disalin ke entry (snapshot), supaya laporan
    // lama tidak berubah saat resep diedit atau dihapus.
    const session = await prisma.productionSession.create({
      data: {
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
      include: { entries: { include: { ingredients: true } } },
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        totalBatch: session.entries.reduce((sum, e) => sum + e.batchCount, 0),
        totalBahanKg: round1(session.entries.reduce((sum, e) => sum + entryKg(e), 0)),
        entryCount: session.entries.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Productions POST error:", error);
    return NextResponse.json({ error: "Gagal menyimpan produksi" }, { status: 500 });
  }
}

// GET /api/productions?before=<id>: riwayat sesi, terbaru dulu, 20 per halaman
export async function GET(request: NextRequest) {
  try {
    const before = Number(request.nextUrl.searchParams.get("before"));

    const sessions = await prisma.productionSession.findMany({
      where: Number.isInteger(before) && before > 0 ? { id: { lt: before } } : undefined,
      orderBy: { id: "desc" },
      take: PAGE_SIZE,
      include: { entries: { include: { ingredients: true } } },
    });

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
        totalBatch: s.entries.reduce((sum, e) => sum + e.batchCount, 0),
        totalBahanKg: round1(s.entries.reduce((sum, e) => sum + entryKg(e), 0)),
        entries: s.entries.map((e) => ({ recipeName: e.recipeName, batchCount: e.batchCount })),
      })),
      nextBefore: sessions.length === PAGE_SIZE ? sessions[sessions.length - 1].id : null,
    });
  } catch (error) {
    console.error("Productions GET error:", error);
    return NextResponse.json({ error: "Gagal memuat riwayat sesi" }, { status: 500 });
  }
}
