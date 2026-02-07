import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool, initializeDatabase } from "@/lib/db";

// GET - fetch all variant groups + options for a model
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeDatabase();
    const { id } = await params;

    const groups = await pool.query(
      'SELECT * FROM "ModelVariantGroup" WHERE "modelId" = $1 ORDER BY "order" ASC, "createdAt" ASC',
      [id],
    );

    const result = [];
    for (const group of groups.rows) {
      const options = await pool.query(
        'SELECT * FROM "ModelVariantOption" WHERE "groupId" = $1 ORDER BY "order" ASC, "createdAt" ASC',
        [group.id],
      );
      result.push({
        ...group,
        options: options.rows.map((o: any) => ({
          ...o,
          priceModifier: parseFloat(o.priceModifier) || 0,
          images: o.images || null,
          parameterOverrides: o.parameterOverrides || null,
        })),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[VARIANTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - save all variant groups + options for a model (replaces everything)
export async function PUT(
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
    const body = await req.json();
    const { groups = [] } = body;

    // Verify model exists and belongs to user
    const modelResult = await pool.query(
      'SELECT "adminId" FROM "Model" WHERE id = $1',
      [id],
    );
    if (modelResult.rows.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    if (modelResult.rows[0].adminId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete all existing variant groups (CASCADE will delete options too)
    await pool.query('DELETE FROM "ModelVariantGroup" WHERE "modelId" = $1', [
      id,
    ]);

    // Insert new groups and options
    const result = [];
    for (let gi = 0; gi < groups.length; gi++) {
      const group = groups[gi];
      if (!group.name?.trim()) continue;

      const groupInsert = await pool.query(
        'INSERT INTO "ModelVariantGroup" (id, "modelId", name, "order", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING *',
        [id, group.name.trim(), gi],
      );
      const newGroup = groupInsert.rows[0];

      const options = [];
      for (let oi = 0; oi < (group.options || []).length; oi++) {
        const opt = group.options[oi];
        if (!opt.name?.trim()) continue;

        const optInsert = await pool.query(
          'INSERT INTO "ModelVariantOption" (id, "groupId", name, "priceModifier", "isDefault", images, "parameterOverrides", "order", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
          [
            newGroup.id,
            opt.name.trim(),
            parseFloat(opt.priceModifier) || 0,
            !!opt.isDefault,
            opt.images ? JSON.stringify(opt.images) : null,
            opt.parameterOverrides
              ? JSON.stringify(opt.parameterOverrides)
              : null,
            oi,
          ],
        );
        options.push({
          ...optInsert.rows[0],
          priceModifier: parseFloat(optInsert.rows[0].priceModifier) || 0,
        });
      }

      result.push({ ...newGroup, options });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[VARIANTS_PUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
