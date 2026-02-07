import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, pool } from "@/lib/db";

// GET /api/accessories?modelId=xxx — get accessory models linked to a parent model (public)
export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const url = new URL(req.url);
    const modelId = url.searchParams.get("modelId");

    if (!modelId) {
      return NextResponse.json([]);
    }

    const result = await pool.query(
      `SELECT DISTINCT m.id, m.name, m.description, m.price, m."categoryId",
              (SELECT url FROM "Image" WHERE "modelId" = m.id ORDER BY "createdAt" DESC LIMIT 1) as "imageUrl"
       FROM "ModelAccessory" ma
       JOIN "Model" m ON (
         (ma."parentModelId" = $1 AND m.id = ma."accessoryModelId")
         OR
         (ma."accessoryModelId" = $1 AND m.id = ma."parentModelId")
       )
       WHERE m.id != $1 AND COALESCE(m.visible, true) = true
       ORDER BY m.name ASC`,
      [modelId],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[PUBLIC_ACCESSORIES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
