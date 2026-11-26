/**
 * Draf hitungan halaman Input, disimpan di localStorage perangkat supaya
 * tidak hilang saat layar terkunci, halaman di-refresh, atau pindah halaman.
 */

export type Counts = Record<number, number>;
export type Draft = { counts: Counts; updatedAt: string };

const KEY = "produksi-dapur:draf-input";

/** Validasi isi penyimpanan. Data rusak atau kosong dianggap tidak ada draf. */
export function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (typeof data?.updatedAt !== "string" || typeof data?.counts !== "object" || !data.counts) {
      return null;
    }
    const counts: Counts = {};
    for (const [key, value] of Object.entries(data.counts)) {
      const id = Number(key);
      if (Number.isInteger(id) && id > 0 && Number.isInteger(value) && (value as number) > 0) {
        counts[id] = value as number;
      }
    }
    return Object.keys(counts).length > 0 ? { counts, updatedAt: data.updatedAt } : null;
  } catch {
    return null;
  }
}

export function readDraft(): Draft | null {
  try {
    return parseDraft(localStorage.getItem(KEY));
  } catch {
    return null; // penyimpanan diblokir (mode privat dsb.)
  }
}

export function writeDraft(counts: Counts): void {
  try {
    if (Object.values(counts).some((v) => v > 0)) {
      localStorage.setItem(KEY, JSON.stringify({ counts, updatedAt: new Date().toISOString() }));
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    // Penyimpanan diblokir: draf hanya bertahan selama halaman terbuka.
  }
}
