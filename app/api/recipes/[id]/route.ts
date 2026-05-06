import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipeId = parseInt(id);
    if (isNaN(recipeId)) {
      return NextResponse.json({ error: "ID resep tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { name, categoryId, description, standardBatchKg, unit, ingredients } = body;

    if (!name || !categoryId || !standardBatchKg) {
      return NextResponse.json(
        { error: "Nama, kategori, dan standar batch wajib diisi" },
        { status: 400 }
      );
    }

    // Gunakan transaction untuk menghapus ingredients lama dan membuat yang baru
    const recipe = await prisma.$transaction(async (tx) => {
      // 1. Hapus ingredient lama
      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      // 2. Update resep dan buat ingredient baru
      return await tx.recipe.update({
        where: { id: recipeId },
        data: {
          name,
          categoryId: Number(categoryId),
          description: description || "",
          standardBatchKg: Number(standardBatchKg),
          unit: unit || "Kg",
          ingredients: {
            create: (ingredients || []).map(
              (
                ing: { name: string; quantity: number; unit: string },
                idx: number
              ) => ({
                ingredientName: ing.name,
                quantity: Number(ing.quantity),
                unit: ing.unit || "Kg",
                sortOrder: idx + 1,
              })
            ),
          },
        },
        include: {
          category: true,
          ingredients: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Recipes PUT error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui resep" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipeId = parseInt(id);
    if (isNaN(recipeId)) {
      return NextResponse.json({ error: "ID resep tidak valid" }, { status: 400 });
    }

    // Because of onDelete: Cascade on ProductionEntry, deleting the recipe will also delete logs.
    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recipes DELETE error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus resep" },
      { status: 500 }
    );
  }
}
