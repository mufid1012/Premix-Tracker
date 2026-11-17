/** Normalisasi kuantitas bahan ke Kg. Satu-satunya sumber aturan konversi. */
export function normalizeToKg(quantity: number, unit: string): number {
  const u = unit.toLowerCase();
  // 1 liter dianggap 1 kg (pendekatan massa jenis air)
  if (u === "kg" || u === "liter" || u === "l") return quantity;
  // ponytail: satuan tanpa berat pasti (mis. "bks") ikut dihitung sebagai gram;
  // tambahkan kolom berat-per-satuan jika bks perlu akurat.
  return quantity / 1000;
}
