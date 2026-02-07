import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeDatabase, pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");

    let query =
      'SELECT id, "categoryId", key, label, type, options, required, "order", "affectsPrice", "priceModifier", "priceModifierType", "isVariant", "variantOptions", "createdAt", "updatedAt" FROM "FeatureDefinition"';
    const params: any[] = [];
    if (categoryId) {
      // Return features for the category plus global features (categoryId IS NULL)
      query +=
        ' WHERE ("categoryId" = $1 OR "categoryId" IS NULL) ORDER BY "order" ASC';
      params.push(categoryId);
    } else {
      query += ' ORDER BY "order" ASC';
    }

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[FEATURES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      categoryId = null,
      key,
      label,
      type = "text",
      options = null,
      required = false,
      order = 0,
      affectsPrice = false,
      priceModifier = null,
      priceModifierType = "fixed",
      isVariant = false,
      variantOptions = null,
    } = body;

    if (!key || !label) {
      return NextResponse.json(
        { error: "Missing key or label" },
        { status: 400 },
      );
    }

    const insert = await pool.query(
      'INSERT INTO "FeatureDefinition" (id, "categoryId", key, label, type, options, required, "order", "affectsPrice", "priceModifier", "priceModifierType", "isVariant", "variantOptions", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING id, "categoryId", key, label, type, options, required, "order", "affectsPrice", "priceModifier", "priceModifierType", "isVariant", "variantOptions", "createdAt", "updatedAt"',
      [
        categoryId,
        key,
        label,
        type,
        options ? JSON.stringify(options) : null,
        required,
        order,
        affectsPrice,
        priceModifier,
        priceModifierType,
        isVariant,
        variantOptions ? JSON.stringify(variantOptions) : null,
      ],
    );

    return NextResponse.json(insert.rows[0], { status: 201 });
  } catch (error) {
    console.error("[FEATURES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
