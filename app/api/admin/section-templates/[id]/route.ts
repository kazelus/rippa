import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT update a section template
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, title, text } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nazwa szablonu jest wymagana" },
        { status: 400 },
      );
    }

    const result = await db.query(
      `UPDATE "SectionTemplate" SET name = $1, title = $2, text = $3, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
      [name, title || "", text || "", id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Szablon nie znaleziony" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating section template:", error);
    return NextResponse.json(
      { error: "Failed to update section template" },
      { status: 500 },
    );
  }
}

// DELETE a section template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await db.query(
      `DELETE FROM "SectionTemplate" WHERE id = $1 RETURNING id`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Szablon nie znaleziony" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting section template:", error);
    return NextResponse.json(
      { error: "Failed to delete section template" },
      { status: 500 },
    );
  }
}
