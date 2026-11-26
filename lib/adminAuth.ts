import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * PIN pemilik untuk aksi yang mengubah resep/kategori atau menghapus sesi.
 * Diatur lewat ADMIN_PIN di .env. Bila kosong, perlindungan nonaktif.
 */

export const ADMIN_COOKIE = "pd_admin";
const SESSION_SECONDS = 12 * 60 * 60;

const pin = () => process.env.ADMIN_PIN?.trim() ?? "";
export const pinEnabled = () => pin().length > 0;

const sign = (expires: number) =>
  createHmac("sha256", pin()).update(`produksi-dapur-admin:${expires}`).digest("hex");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const checkPin = (input: unknown) =>
  typeof input === "string" && safeEqual(input.trim(), pin());

/** Nilai cookie "<kedaluwarsa>.<tanda tangan>"; berganti PIN membatalkan semua cookie lama. */
export function issueToken(now = Date.now()) {
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  return { value: `${expires}.${sign(expires)}`, maxAge: SESSION_SECONDS };
}

export function verifyToken(value: string | undefined, now = Date.now()) {
  if (!value) return false;
  const [exp, sig] = value.split(".");
  const expires = Number(exp);
  return (
    Number.isInteger(expires) && expires * 1000 > now && !!sig && safeEqual(sig, sign(expires))
  );
}

export const isAdmin = (request: NextRequest) =>
  !pinEnabled() || verifyToken(request.cookies.get(ADMIN_COOKIE)?.value);

/** null bila boleh lanjut; respons 401 bila perlu PIN. */
export function requireAdmin(request: NextRequest): NextResponse | null {
  return isAdmin(request)
    ? null
    : NextResponse.json({ error: "PIN pemilik diperlukan", needPin: true }, { status: 401 });
}

// ponytail: pembatas percobaan di memori per IP, hilang saat server restart;
// cukup untuk jaringan warung, ganti ke penyimpanan bersama bila server lebih dari satu.
const attempts = new Map<string, { fails: number; lockedUntil: number }>();
const MAX_FAILS = 5;
const LOCK_MS = 60_000;

export function attemptGate(ip: string, now = Date.now()) {
  const a = attempts.get(ip);
  return {
    locked: !!a && a.lockedUntil > now,
    fail() {
      const fails = (a && a.lockedUntil <= now && a.fails >= MAX_FAILS ? 0 : (a?.fails ?? 0)) + 1;
      attempts.set(ip, { fails, lockedUntil: fails >= MAX_FAILS ? now + LOCK_MS : 0 });
    },
    reset() {
      attempts.delete(ip);
    },
  };
}
