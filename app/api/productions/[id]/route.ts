import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/productions/:id: hapus satu sesi beserta entry dan snapshot bahannya (FK cascade)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = Number((await params).id);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return NextResponse.json({ error: "ID sesi tidak valid" }, { status: 400 });
    }

    const { count } = await prisma.productionSession.deleteMany({ where: { id: sessionId } });
    if (count === 0) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Productions DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus sesi" }, { status: 500 });
  }
}
