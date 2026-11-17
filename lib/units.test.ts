// Jalankan: npx tsx --test lib/units.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeToKg } from "./units";

test("normalizeToKg", () => {
  assert.equal(normalizeToKg(2, "Kg"), 2);
  assert.equal(normalizeToKg(2, "Liter"), 2);
  assert.equal(normalizeToKg(2, "l"), 2);
  assert.equal(normalizeToKg(500, "gr"), 0.5);
  assert.equal(normalizeToKg(500, "ml"), 0.5);
  assert.equal(normalizeToKg(2, "sdt"), 0.01);
  assert.equal(normalizeToKg(2, "sdm"), 0.03);
  assert.equal(normalizeToKg(1, "SDM"), 0.015);
});
