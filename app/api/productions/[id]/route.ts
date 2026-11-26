import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { summarizeSession } from "@/lib/sessionSummary";

// Sesi yang umurnya kurang dari ini boleh diubah/dihapus tanpa PIN (koreksi tepat setelah menyimpan).
const UNDO_WINDOW_MS = 60_000;

type Params = { params: Promise<{ id: string }> };
type EntryChange = { id: number; batchCount: number };

/** Validasi ID dan izin; mengembalikan respons galat atau ID sesi yang boleh diubah. */
async function authorize(request: NextRequest, params: Params["params"]) {
  const sessionId = Number((await params).id);
  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return { error: NextResponse.json({ error: "ID sesi tidak valid" }, { status: 400 }) };
  }

  const session = await prisma.productionSession.findUnique({
    where: { id: sessionId },
    select: { createdAt: true, entries: { select: { id: true } } },
  });
  if (!session) {
    return { error: NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 }) };
  }

  if (Date.now() - session.createdAt.getTime() > UNDO_WINDOW_MS) {
    const denied = requireAdmin(request);
    if (denied) return { error: denied };
  }

  return { sessionId, entryIds: new Set(session.entries.map((e) => e.id)) };
}

const isEntryChange = (e: unknown): e is EntryChange =>
  typeof e === "object" &&
  e !== null &&
  Number.isInteger((e as EntryChange).id) &&
  Number.isInteger((e as EntryChange).batchCount) &&
  (e as EntryChange).batchCount >= 0;

// PATCH /api/productions/:id { entries: [{ id, batchCount }] }: koreksi jumlah resep dalam sesi.
// Jumlah 0 menghapus resep itu dari sesi; bila semuanya 0, sesi ikut dihapus.
// Snapshot komposisi bahan tidak berubah.
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await authorize(request, params);
    if ("error" in auth) return auth.error;

    const body = await request.json().catch(() => null);
    const changes: unknown[] = Array.isArray(body?.entries) ? body.entries : [];
    if (
      changes.length === 0 ||
      !changes.every(isEntryChange) ||
      !(changes as EntryChange[]).every((c) => auth.entryIds.has(c.id))
    ) {
      return NextResponse.json({ error: "Data perubahan tidak valid" }, { status: 400 });
    }

    const list = changes as EntryChange[];
    const removed = list.filter((c) => c.batchCount === 0).map((c) => c.id);
    const remaining = [...auth.entryIds].filter((id) => !removed.includes(id));

    if (remaining.length === 0) {
      await prisma.productionSession.deleteMany({ where: { id: auth.sessionId } });
      return NextResponse.json({ deleted: true });
    }

    await prisma.$transaction([
      prisma.productionEntry.deleteMany({ where: { id: { in: removed } } }),
      ...list
        .filter((c) => c.batchCount > 0)
        .map((c) =>
          prisma.productionEntry.update({ where: { id: c.id }, data: { batchCount: c.batchCount } })
        ),
    ]);

    const updated = await prisma.productionSession.findUniqueOrThrow({
      where: { id: auth.sessionId },
      include: { entries: { include: { ingredients: true } } },
    });
    return NextResponse.json({ deleted: false, session: summarizeSession(updated) });
  } catch (error) {
    console.error("Productions PATCH error:", error);
    return NextResponse.json({ error: "Gagal mengubah sesi" }, { status: 500 });
  }
}

// DELETE /api/productions/:id: hapus satu sesi beserta entry dan snapshot bahannya (FK cascade)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await authorize(request, params);
    if ("error" in auth) return auth.error;

    await prisma.productionSession.deleteMany({ where: { id: auth.sessionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Productions DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus sesi" }, { status: 500 });
  }
}
