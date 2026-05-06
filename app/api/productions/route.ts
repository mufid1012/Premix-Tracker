import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/productions — Create a production session with entries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body as {
      entries: Array<{ recipeId: number; batchCount: number }>;
    };

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 entry produksi diperlukan" },
        { status: 400 }
      );
    }

    // Filter only entries with batchCount > 0
    const validEntries = entries.filter((e) => e.batchCount > 0);

    if (validEntries.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada batch yang dicatat" },
        { status: 400 }
      );
    }

    // Create session + entries in a transaction
    const session = await prisma.productionSession.create({
      data: {
        status: "completed",
        completedAt: new Date(),
        entries: {
          create: validEntries.map((e) => ({
            recipeId: e.recipeId,
            batchCount: e.batchCount,
          })),
        },
      },
      include: {
        entries: {
          include: {
            recipe: {
              include: { ingredients: true },
            },
          },
        },
      },
    });

    // Calculate total ingredients used
    let totalBahanKg = 0;
    for (const entry of session.entries) {
      for (const ing of entry.recipe.ingredients) {
        const u = ing.unit.toLowerCase();
        const factor =
          u === "kg" ? 1 : u === "gr" || u === "gram" || u === "g" ? 0.001 : 0.001;
        totalBahanKg += entry.batchCount * ing.quantity * factor;
      }
    }

    const totalBatch = session.entries.reduce(
      (sum, e) => sum + e.batchCount,
      0
    );

    return NextResponse.json(
      {
        sessionId: session.id,
        totalBatch,
        totalBahanKg: Math.round(totalBahanKg * 10) / 10,
        entryCount: session.entries.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Productions POST error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan produksi" },
      { status: 500 }
    );
  }
}

// GET /api/productions — Get recent production sessions
export async function GET() {
  try {
    const sessions = await prisma.productionSession.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        entries: {
          include: {
            recipe: true,
          },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Productions GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data produksi" },
      { status: 500 }
    );
  }
}
