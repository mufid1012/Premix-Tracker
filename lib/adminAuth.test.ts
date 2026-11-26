// Jalankan: npx tsx --test lib/adminAuth.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { attemptGate, checkPin, issueToken, pinEnabled, verifyToken } from "./adminAuth";

test("PIN dan token", () => {
  process.env.ADMIN_PIN = "";
  assert.equal(pinEnabled(), false);

  process.env.ADMIN_PIN = "4321";
  assert.equal(pinEnabled(), true);
  assert.equal(checkPin("4321"), true);
  assert.equal(checkPin(" 4321 "), true);
  assert.equal(checkPin("1234"), false);
  assert.equal(checkPin(4321), false);

  const now = Date.now();
  const { value } = issueToken(now);
  assert.equal(verifyToken(value, now), true);
  assert.equal(verifyToken(value, now + 13 * 3600 * 1000), false); // kedaluwarsa
  assert.equal(
    verifyToken(
      value.replace(/.$/, (c) => (c === "0" ? "1" : "0")),
      now
    ),
    false
  ); // diubah
  assert.equal(verifyToken(undefined, now), false);

  process.env.ADMIN_PIN = "9999"; // ganti PIN membatalkan cookie lama
  assert.equal(verifyToken(value, now), false);
});

test("batas percobaan", () => {
  const ip = "10.0.0.9";
  const t = 1_000_000;
  for (let i = 0; i < 5; i++) {
    assert.equal(attemptGate(ip, t).locked, false);
    attemptGate(ip, t).fail();
  }
  assert.equal(attemptGate(ip, t + 1000).locked, true);
  assert.equal(attemptGate(ip, t + 61_000).locked, false); // kunci 1 menit selesai
  attemptGate(ip, t + 61_000).fail(); // hitungan mulai lagi dari 1
  assert.equal(attemptGate(ip, t + 62_000).locked, false);
  attemptGate(ip, t).reset();
});
