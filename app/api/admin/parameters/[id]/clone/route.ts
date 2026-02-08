import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDatabase, pool } from "@/lib/db";

export async function POST(
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

    // Fetch the original parameter
    const original = await pool.query(
      'SELECT * FROM "ParameterDefinition" WHERE id = $1',
      [id],
    );

    if (original.rows.length === 0) {
      return NextResponse.json(
        { error: "Parameter not found" },
        { status: 404 },
      );
    }

    const p = original.rows[0];

    // Create a clone with modified key and label
    const cloned = await pool.query(
      `INSERT INTO "ParameterDefinition" (id, "categoryId", key, label, unit, type, options, required, "order", "group", "affectsPrice", "priceModifier", "priceModifierType", "isVariant", "variantOptions", "isQuickSpec", "quickSpecOrder", "quickSpecLabel", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
       RETURNING *`,
      [
        p.categoryId,
        p.key + "_copy",
        p.label + " (kopia)",
        p.unit,
        p.type,
        p.options ? JSON.stringify(p.options) : null,
        p.required,
        (p.order || 0) + 1,
        p.group,
        p.affectsPrice || false,
        p.priceModifier,
        p.priceModifierType,
        p.isVariant || false,
        p.variantOptions ? JSON.stringify(p.variantOptions) : null,
        p.isQuickSpec || false,
        p.quickSpecOrder || 0,
        p.quickSpecLabel,
      ],
    );

    return NextResponse.json(cloned.rows[0], { status: 201 });
  } catch (error) {
    console.error("[PARAMETER_CLONE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
