// Jalankan: npx tsx --test lib/recipeInput.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRecipeInput } from "./recipeInput";

test("parseRecipeInput", () => {
  const ok = parseRecipeInput({
    name: "  Sambal  ",
    categoryId: "7",
    standardBatchKg: 0.5,
    ingredients: [
      { name: "Cabai", quantity: "300", unit: "gr" },
      { name: " ", quantity: 10, unit: "gr" }, // nama kosong dibuang
      { name: "Garam", quantity: 0, unit: "gr" }, // jumlah 0 dibuang
      { name: "Gula", quantity: 2, unit: "" }, // satuan kosong jadi Kg
    ],
  });
  assert.deepEqual(ok, {
    name: "Sambal",
    categoryId: 7,
    description: "",
    standardBatchKg: 0.5,
    unit: "Kg",
    ingredients: [
      { ingredientName: "Cabai", quantity: 300, unit: "gr", sortOrder: 1 },
      { ingredientName: "Gula", quantity: 2, unit: "Kg", sortOrder: 2 },
    ],
  });

  assert.equal(parseRecipeInput({ name: "", categoryId: 1, standardBatchKg: 1 }), null);
  assert.equal(parseRecipeInput({ name: "A", categoryId: "x", standardBatchKg: 1 }), null);
  assert.equal(parseRecipeInput({ name: "A", categoryId: 1, standardBatchKg: 0 }), null);
  assert.equal(parseRecipeInput(null), null);
});
