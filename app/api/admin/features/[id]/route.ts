import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDatabase, pool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await initializeDatabase();
    const id = params.id;
    const result = await pool.query(
      'SELECT id, "categoryId", key, label, type, options, required, "order", "createdAt", "updatedAt" FROM "FeatureDefinition" WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("[FEATURE_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await initializeDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    const body = await req.json();
    const {
      categoryId = null,
      key,
      label,
      type = "text",
      options = null,
      required = false,
      order = 0,
    } = body;

    const update = await pool.query(
      'UPDATE "FeatureDefinition" SET "categoryId" = $1, key = $2, label = $3, type = $4, options = $5, required = $6, "order" = $7, "updatedAt" = NOW() WHERE id = $8 RETURNING id, "categoryId", key, label, type, options, required, "order", "createdAt", "updatedAt"',
      [
        categoryId,
        key,
        label,
        type,
        options ? JSON.stringify(options) : null,
        required,
        order,
        id,
      ],
    );

    if (update.rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(update.rows[0]);
  } catch (error) {
    console.error("[FEATURE_PUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await initializeDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    await pool.query('DELETE FROM "FeatureDefinition" WHERE id = $1', [id]);
    // cascade will remove product values
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[FEATURE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
