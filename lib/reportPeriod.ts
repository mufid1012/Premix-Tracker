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

/** Senin = 0, ..., Minggu = 6 */
const daysSinceMonday = (d: Date) => (d.getDay() + 6) % 7;

const fmt = (d: Date) =>
  d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const dailyBuckets = (first: Date) =>
  Array.from({ length: 7 }, (_, i) => {
    const start = addDays(first, i);
    return {
      label: `${DAY_NAMES[start.getDay()]} ${start.getDate()}`,
      start,
      end: addDays(start, 1),
    };
  });

/**
 * Rentang laporan. offset 0 = periode berjalan, 1 = periode sebelumnya, dst.
 * Mingguan = minggu kalender Senin-Minggu; offset 0 = minggu ini (hari setelah hari ini masih 0).
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
    const start = addDays(today, -daysSinceMonday(today) - 7 * offset);
    const end = addDays(start, 7);
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

/** Kebalikan periodRange: offset periode yang memuat tanggal `picked`. Tanggal di masa depan = 0. */
export function offsetForDate(period: Period, picked: Date, now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate());
  const daysAgo = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  const months = (today.getFullYear() - day.getFullYear()) * 12 + today.getMonth() - day.getMonth();
  const offset =
    period === "harian"
      ? daysAgo
      : period === "mingguan"
        ? Math.ceil((daysAgo - daysSinceMonday(today)) / 7)
        : months;
  return Math.max(offset, 0);
}

/** Tanggal untuk input type="date": tanggal terakhir di rentang terpilih, format YYYY-MM-DD. */
export function rangeEndValue(period: Period, offset: number, now = new Date()): string {
  const last = addDays(periodRange(period, offset, now).end, -1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`;
}
