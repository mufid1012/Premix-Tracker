/** Taksiran berat satu sendok; isi sendok sebenarnya beda-beda per bahan. */
export const GRAM_PER_SDT = 5;
export const GRAM_PER_SDM = 15;

/** Keterangan untuk setiap total kg yang mungkin berisi bahan sendokan */
export const SPOON_ESTIMATE_NOTE = `Bahan sendokan ditaksir: 1 sdt = ${GRAM_PER_SDT} g, 1 sdm = ${GRAM_PER_SDM} g.`;

/** Normalisasi kuantitas bahan ke Kg. Satu-satunya sumber aturan konversi. */
export function normalizeToKg(quantity: number, unit: string): number {
  const u = unit.toLowerCase();
  // 1 liter dianggap 1 kg (pendekatan massa jenis air)
  if (u === "kg" || u === "liter" || u === "l") return quantity;
  if (u === "sdt") return (quantity * GRAM_PER_SDT) / 1000;
  if (u === "sdm") return (quantity * GRAM_PER_SDM) / 1000;
  // gr, ml, dan satuan lain dihitung sebagai gram
  return quantity / 1000;
}

/** Total bahan (kg) satu entry produksi: jumlah resep x komposisi snapshot-nya. */
export function entryKg(entry: {
  batchCount: number;
  ingredients: Array<{ quantity: number; unit: string }>;
}): number {
  return entry.ingredients.reduce(
    (sum, ing) => sum + entry.batchCount * normalizeToKg(ing.quantity, ing.unit),
    0
  );
}

/** Bulatkan ke 1 desimal untuk tampilan kg */
export const round1 = (n: number) => Math.round(n * 10) / 10;
