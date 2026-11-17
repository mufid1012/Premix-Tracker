export type Period = "harian" | "mingguan" | "bulanan";

export interface Bucket {
  label: string;
  start: Date;
  end: Date; // eksklusif
}

export interface PeriodRange {
  /** Rentang ringkasan (total, top resep, top bahan); end eksklusif */
  start: Date;
  end: Date;
  /** Batang grafik tren. Untuk harian mencakup 7 hari yang berakhir di hari terpilih. */
  buckets: Bucket[];
  dateRange: string;
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const fmt = (d: Date) =>
  d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const dailyBuckets = (first: Date) =>
  Array.from({ length: 7 }, (_, i) => {
    const start = addDays(first, i);
    return { label: `${DAY_NAMES[start.getDay()]} ${start.getDate()}`, start, end: addDays(start, 1) };
  });

/**
 * Rentang laporan. offset 0 = periode berjalan, 1 = periode sebelumnya, dst.
 * Mingguan = 7 hari yang berakhir hari ini (bukan minggu kalender), digeser 7 hari per offset.
 */
export function periodRange(period: Period, offset: number, now = new Date()): PeriodRange {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "harian") {
    const start = addDays(today, -offset);
    return {
      start,
      end: addDays(start, 1),
      buckets: dailyBuckets(addDays(start, -6)),
      dateRange: fmt(start),
    };
  }

  if (period === "mingguan") {
    const end = addDays(today, 1 - 7 * offset);
    const start = addDays(end, -7);
    return {
      start,
      end,
      buckets: dailyBuckets(start),
      dateRange: `${fmt(start)} - ${fmt(addDays(end, -1))}`,
    };
  }

  const start = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  // Minggu 4 menampung tanggal 22 sampai akhir bulan
  const buckets = [1, 8, 15, 22].map((day, i, all) => ({
    label: `Minggu ${i + 1}`,
    start: new Date(start.getFullYear(), start.getMonth(), day),
    end: i < all.length - 1 ? new Date(start.getFullYear(), start.getMonth(), all[i + 1]) : end,
  }));
  return {
    start,
    end,
    buckets,
    dateRange: start.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
  };
}
