import { entryKg, round1 } from "./units";

type SessionWithEntries = {
  id: number;
  createdAt: Date;
  entries: Array<{
    id: number;
    recipeName: string;
    batchCount: number;
    ingredients: Array<{ quantity: number; unit: string }>;
  }>;
};

/** Bentuk sesi untuk halaman Riwayat (dipakai GET daftar dan PATCH ubah jumlah). */
export function summarizeSession(s: SessionWithEntries) {
  return {
    id: s.id,
    createdAt: s.createdAt,
    totalBatch: s.entries.reduce((sum, e) => sum + e.batchCount, 0),
    totalBahanKg: round1(s.entries.reduce((sum, e) => sum + entryKg(e), 0)),
    entries: s.entries.map((e) => ({ id: e.id, recipeName: e.recipeName, batchCount: e.batchCount })),
  };
}
