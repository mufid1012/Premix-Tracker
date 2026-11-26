import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { parseRecipeInput, RECIPE_INPUT_ERROR } from "@/lib/recipeInput";

const withDetails = {
  category: true,
  ingredients: { orderBy: { sortOrder: "asc" as const } },
};

// GET /api/recipes?category=<id>&search=<teks>&sort=popular
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const categoryId = Number(params.get("category"));
    const search = params.get("search")?.trim();

    const recipes = await prisma.recipe.findMany({
      where: {
        // "all" atau nilai bukan angka berarti tanpa filter kategori
        ...(Number.isInteger(categoryId) && categoryId > 0 ? { categoryId } : {}),
        ...(search ? { name: { contains: search } } : {}),
      },
      include: withDetails,
      // sort=popular: resep yang paling sering dicatat di produksi tampil paling atas
      orderBy:
        params.get("sort") === "popular"
          ? [{ productions: { _count: "desc" } }, { name: "asc" }]
          : { createdAt: "desc" },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Recipes GET error:", error);
    return NextResponse.json({ error: "Gagal memuat resep" }, { status: 500 });
  }
}

// POST /api/recipes: buat resep baru (perlu PIN pemilik bila diaktifkan)
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const input = parseRecipeInput(await request.json().catch(() => null));
    if (!input) return NextResponse.json({ error: RECIPE_INPUT_ERROR }, { status: 400 });

    if (!(await prisma.category.findUnique({ where: { id: input.categoryId } }))) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
    }

    const { ingredients, ...recipe } = input;
    const created = await prisma.recipe.create({
      data: { ...recipe, ingredients: { create: ingredients } },
      include: withDetails,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Recipes POST error:", error);
    return NextResponse.json({ error: "Gagal membuat resep" }, { status: 500 });
  }
}
