import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Test if Prisma is initialized
    const { prisma } = await import("@/lib/prisma");

    // Try a simple query
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: "Prisma is connected",
      userCount,
    });
  } catch (error: any) {
    console.error("[HEALTH_CHECK]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Prisma not initialized",
      },
      { status: 500 },
    );
  }
}
