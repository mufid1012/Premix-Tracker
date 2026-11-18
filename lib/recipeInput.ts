/** Isian resep dari body POST/PUT yang sudah divalidasi, siap untuk Prisma. */
export interface RecipeInput {
  name: string;
  categoryId: number;
  description: string;
  standardBatchKg: number;
  unit: string;
  ingredients: Array<{ ingredientName: string; quantity: number; unit: string; sortOrder: number }>;
}

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** null bila nama, kategori, atau standar batch tidak valid. Bahan kosong/0 dibuang. */
export function parseRecipeInput(body: unknown): RecipeInput | null {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = text(b.name);
  const categoryId = Number(b.categoryId);
  const standardBatchKg = Number(b.standardBatchKg);
  if (!name || !Number.isInteger(categoryId) || categoryId <= 0 || !(standardBatchKg > 0)) {
    return null;
  }

  const rawIngredients = Array.isArray(b.ingredients) ? b.ingredients : [];
  const ingredients = rawIngredients
    .map((ing) => ing as Record<string, unknown>)
    .filter((ing) => text(ing?.name) && Number(ing.quantity) > 0)
    .map((ing, idx) => ({
      ingredientName: text(ing.name),
      quantity: Number(ing.quantity),
      unit: text(ing.unit) || "Kg",
      sortOrder: idx + 1,
    }));

  return {
    name,
    categoryId,
    description: text(b.description),
    standardBatchKg,
    unit: text(b.unit) || "Kg",
    ingredients,
  };
}

export const RECIPE_INPUT_ERROR = "Nama, kategori, dan standar batch wajib diisi";
