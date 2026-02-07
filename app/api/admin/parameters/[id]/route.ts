import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDatabase, pool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDatabase();
    const { id } = await params;
    const result = await pool.query(
      'SELECT id, "categoryId", key, label, unit, type, options, required, "order", "group", "affectsPrice", "priceModifier", "priceModifierType", "isVariant", "variantOptions", "isQuickSpec", "quickSpecOrder", "quickSpecLabel", "createdAt", "updatedAt" FROM "ParameterDefinition" WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("[PARAMETER_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const {
      categoryId = null,
      key,
      label,
      unit = null,
      type = "text",
      options = null,
      required = false,
      order = 0,
      group = null,
      affectsPrice = false,
      priceModifier = null,
      priceModifierType = "fixed",
      isVariant = false,
      variantOptions = null,
      isQuickSpec = false,
      quickSpecOrder = 0,
      quickSpecLabel = null,
    } = body;

    const update = await pool.query(
      'UPDATE "ParameterDefinition" SET "categoryId" = $1, key = $2, label = $3, unit = $4, type = $5, options = $6, required = $7, "order" = $8, "group" = $9, "affectsPrice" = $10, "priceModifier" = $11, "priceModifierType" = $12, "isVariant" = $13, "variantOptions" = $14, "isQuickSpec" = $15, "quickSpecOrder" = $16, "quickSpecLabel" = $17, "updatedAt" = NOW() WHERE id = $18 RETURNING id, "categoryId", key, label, unit, type, options, required, "order", "group", "affectsPrice", "priceModifier", "priceModifierType", "isVariant", "variantOptions", "isQuickSpec", "quickSpecOrder", "quickSpecLabel", "createdAt", "updatedAt"',
      [
        categoryId,
        key,
        label,
        unit,
        type,
        options ? JSON.stringify(options) : null,
        required,
        Math.round(Number(order) || 0),
        group,
        !!affectsPrice,
        priceModifier,
        priceModifierType,
        !!isVariant,
        variantOptions ? JSON.stringify(variantOptions) : null,
        !!isQuickSpec,
        Math.round(Number(quickSpecOrder) || 0),
        quickSpecLabel || null,
        id,
      ],
    );

    if (update.rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(update.rows[0]);
  } catch (error) {
    console.error("[PARAMETER_PUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await pool.query('DELETE FROM "ParameterDefinition" WHERE id = $1', [id]);
    // cascade will remove product values
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PARAMETER_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
