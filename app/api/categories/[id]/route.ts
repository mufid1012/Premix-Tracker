import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    // Periksa apakah kategori ini masih memiliki resep
    const recipesCount = await prisma.recipe.count({
      where: { categoryId },
    });

    if (recipesCount > 0) {
      return NextResponse.json(
        { error: "Kategori tidak bisa dihapus karena masih berisi resep." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Categories DELETE error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
