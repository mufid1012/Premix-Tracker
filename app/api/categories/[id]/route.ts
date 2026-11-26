import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// DELETE /api/categories/:id: hanya bila kategori sudah tidak berisi resep
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const categoryId = Number((await params).id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json({ error: "ID kategori tidak valid" }, { status: 400 });
    }

    if ((await prisma.recipe.count({ where: { categoryId } })) > 0) {
      return NextResponse.json(
        { error: "Kategori tidak bisa dihapus karena masih berisi resep." },
        { status: 400 }
      );
    }

    const { count } = await prisma.category.deleteMany({ where: { id: categoryId } });
    if (count === 0) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Categories DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
