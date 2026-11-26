import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { parseRecipeInput, RECIPE_INPUT_ERROR } from "@/lib/recipeInput";

type Params = { params: Promise<{ id: string }> };

const parseId = async (params: Params["params"]) => {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// PUT /api/recipes/:id: ganti isi resep dan seluruh komposisi bahannya
export async function PUT(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const recipeId = await parseId(params);
    if (!recipeId) return NextResponse.json({ error: "ID resep tidak valid" }, { status: 400 });

    const input = parseRecipeInput(await request.json().catch(() => null));
    if (!input) return NextResponse.json({ error: RECIPE_INPUT_ERROR }, { status: 400 });

    const [recipeExists, categoryExists] = await Promise.all([
      prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } }),
      prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } }),
    ]);
    if (!recipeExists) return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 404 });
    if (!categoryExists) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
    }

    // Bahan lama dihapus lalu diganti, dalam satu transaksi supaya tidak setengah jadi
    const { ingredients, ...recipe } = input;
    const updated = await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { recipeId } });
      return tx.recipe.update({
        where: { id: recipeId },
        data: { ...recipe, ingredients: { create: ingredients } },
        include: { category: true, ingredients: { orderBy: { sortOrder: "asc" } } },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Recipes PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui resep" }, { status: 500 });
  }
}

// DELETE /api/recipes/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const recipeId = await parseId(params);
    if (!recipeId) return NextResponse.json({ error: "ID resep tidak valid" }, { status: 400 });

    // Riwayat produksi tetap ada: entry menyimpan snapshot nama dan komposisi (onDelete: SetNull)
    const { count } = await prisma.recipe.deleteMany({ where: { id: recipeId } });
    if (count === 0) return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recipes DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus resep" }, { status: 500 });
  }
}
