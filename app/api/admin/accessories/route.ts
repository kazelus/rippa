import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDatabase, pool } from "@/lib/db";

// GET /api/admin/accessories?modelId=xxx — get accessory models linked to a parent model
export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const url = new URL(req.url);
    const modelId = url.searchParams.get("modelId");

    if (!modelId) {
      return NextResponse.json(
        { error: "modelId is required" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `SELECT DISTINCT m.id, m.name, m.price, m."categoryId",
              (SELECT url FROM "Image" WHERE "modelId" = m.id ORDER BY "createdAt" DESC LIMIT 1) as "imageUrl"
       FROM "ModelAccessory" ma
       JOIN "Model" m ON (
         (ma."parentModelId" = $1 AND m.id = ma."accessoryModelId")
         OR
         (ma."accessoryModelId" = $1 AND m.id = ma."parentModelId")
       )
       WHERE m.id != $1
       ORDER BY m.name ASC`,
      [modelId],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[ACCESSORIES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/accessories — replace all accessory links for a model
export async function PUT(req: NextRequest) {
  try {
    await initializeDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { modelId, accessoryModelIds = [] } = body;

    if (!modelId) {
      return NextResponse.json(
        { error: "modelId is required" },
        { status: 400 },
      );
    }

    // Delete existing links
    await pool.query(
      'DELETE FROM "ModelAccessory" WHERE "parentModelId" = $1',
      [modelId],
    );

    // Insert new links
    for (const accModelId of accessoryModelIds) {
      if (accModelId === modelId) continue; // don't link model to itself
      await pool.query(
        `INSERT INTO "ModelAccessory" (id, "parentModelId", "accessoryModelId")
         VALUES (gen_random_uuid()::text, $1, $2)
         ON CONFLICT ("parentModelId", "accessoryModelId") DO NOTHING`,
        [modelId, accModelId],
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ACCESSORIES_PUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
