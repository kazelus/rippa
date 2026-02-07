import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDatabase, pool } from "@/lib/db";

// DELETE /api/admin/accessories/:id — remove a single ModelAccessory link by its ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await pool.query(
      'DELETE FROM "ModelAccessory" WHERE id = $1 RETURNING id',
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Nie znaleziono powiązania" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ACCESSORY_LINK_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
