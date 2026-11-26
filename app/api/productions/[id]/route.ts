import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// Sesi yang umurnya kurang dari ini boleh dihapus tanpa PIN (tombol Batalkan setelah menyimpan).
const UNDO_WINDOW_MS = 60_000;

// DELETE /api/productions/:id: hapus satu sesi beserta entry dan snapshot bahannya (FK cascade)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = Number((await params).id);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return NextResponse.json({ error: "ID sesi tidak valid" }, { status: 400 });
    }

    const session = await prisma.productionSession.findUnique({
      where: { id: sessionId },
      select: { createdAt: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    if (Date.now() - session.createdAt.getTime() > UNDO_WINDOW_MS) {
      const denied = requireAdmin(request);
      if (denied) return denied;
    }

    await prisma.productionSession.deleteMany({ where: { id: sessionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Productions DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus sesi" }, { status: 500 });
  }
}
