// Jalankan: npx tsx --test lib/draft.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDraft } from "./draft";

test("parseDraft", () => {
  const at = "2026-11-18T08:00:00.000Z";
  assert.deepEqual(parseDraft(JSON.stringify({ counts: { 3: 2, 7: 1 }, updatedAt: at })), {
    counts: { 3: 2, 7: 1 },
    updatedAt: at,
  });
  // nilai tidak valid dibuang, sisanya dipertahankan
  assert.deepEqual(
    parseDraft(JSON.stringify({ counts: { 3: 0, 4: -1, 5: 1.5, x: 2, 6: "2", 8: 4 }, updatedAt: at })),
    { counts: { 8: 4 }, updatedAt: at }
  );
  assert.equal(parseDraft(JSON.stringify({ counts: { 3: 0 }, updatedAt: at })), null);
  assert.equal(parseDraft(JSON.stringify({ counts: { 3: 1 } })), null);
  assert.equal(parseDraft("bukan json"), null);
  assert.equal(parseDraft("null"), null);
  assert.equal(parseDraft(null), null);
});
