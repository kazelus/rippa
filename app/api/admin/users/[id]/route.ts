import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent deleting the current user
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Nie możesz usunąć siebie" },
        { status: 400 },
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Użytkownik nie znaleziony" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 },
    );
  }
}
