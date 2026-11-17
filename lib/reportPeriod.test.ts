// Jalankan: npx tsx --test lib/reportPeriod.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { periodRange } from "./reportPeriod";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const now = new Date(2026, 10, 18, 14, 30); // Rabu 18 Nov 2026, 14.30

test("harian", () => {
  const r = periodRange("harian", 0, now);
  assert.deepEqual([r.start, r.end], [d(2026, 11, 18), d(2026, 11, 19)]);
  // tren 7 hari berakhir di hari terpilih
  assert.equal(r.buckets.length, 7);
  assert.deepEqual(r.buckets[0].start, d(2026, 11, 12));
  assert.equal(r.buckets[6].label, "Rab 18");

  const prev = periodRange("harian", 18, now);
  assert.deepEqual(prev.start, d(2026, 10, 31)); // lewat batas bulan
});

test("mingguan", () => {
  const r = periodRange("mingguan", 0, now);
  assert.deepEqual([r.start, r.end], [d(2026, 11, 12), d(2026, 11, 19)]);
  const prev = periodRange("mingguan", 1, now);
  assert.deepEqual([prev.start, prev.end], [d(2026, 11, 5), d(2026, 11, 12)]);
  assert.deepEqual(prev.buckets[6].start, d(2026, 11, 11));
});

test("bulanan", () => {
  const r = periodRange("bulanan", 0, now);
  assert.deepEqual([r.start, r.end], [d(2026, 11, 1), d(2026, 12, 1)]);
  assert.deepEqual(r.buckets[3].start, d(2026, 11, 22));
  assert.deepEqual(r.buckets[3].end, d(2026, 12, 1));

  const jan = periodRange("bulanan", 10, now); // lewat batas tahun
  assert.deepEqual([jan.start, jan.end], [d(2026, 1, 1), d(2026, 2, 1)]);
  const lastYear = periodRange("bulanan", 11, now);
  assert.deepEqual(lastYear.start, d(2025, 12, 1));
});
