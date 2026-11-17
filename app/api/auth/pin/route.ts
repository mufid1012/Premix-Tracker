import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, attemptGate, checkPin, issueToken, pinEnabled } from "@/lib/adminAuth";

// POST /api/auth/pin { pin } : buka akses pemilik di perangkat ini selama 12 jam
export async function POST(request: NextRequest) {
  if (!pinEnabled()) return NextResponse.json({ success: true });

  // ponytail: satu penghitung bersama, bukan per IP. Header X-Forwarded-For bisa
  // dipalsukan di jaringan tanpa proxy, jadi tidak dipakai. Akibatnya salah PIN dari
  // satu perangkat ikut mengunci yang lain selama 1 menit; per-IP butuh proxy tepercaya.
  const gate = attemptGate("semua");
  if (gate.locked) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Tunggu 1 menit." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!checkPin(body?.pin)) {
    gate.fail();
    return NextResponse.json({ error: "PIN salah" }, { status: 401 });
  }

  gate.reset();
  const { value, maxAge } = issueToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, value, { httpOnly: true, sameSite: "strict", path: "/", maxAge });
  return res;
}
