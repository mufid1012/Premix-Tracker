import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/recipes — List all recipes with optional category/search filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (categoryId && categoryId !== "all") {
      where.categoryId = Number(categoryId);
    }

    if (search) {
      where.name = { contains: search };
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        category: true,
        ingredients: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Recipes GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat resep" },
      { status: 500 }
    );
  }
}

// POST /api/recipes — Create a new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categoryId, description, standardBatchKg, unit, ingredients } =
      body;

    if (!name || !categoryId || !standardBatchKg) {
      return NextResponse.json(
        { error: "Nama, kategori, dan standar batch wajib diisi" },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
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

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Recipes POST error:", error);
    return NextResponse.json(
      { error: "Gagal membuat resep" },
      { status: 500 }
    );
  }
}
