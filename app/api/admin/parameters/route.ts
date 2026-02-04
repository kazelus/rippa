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
      'SELECT id, "categoryId", key, label, unit, type, options, required, "order", "createdAt", "updatedAt" FROM "ParameterDefinition"';
    const params: any[] = [];
    if (categoryId) {
      // Return parameters for the category plus global parameters (categoryId IS NULL)
      query +=
        ' WHERE ("categoryId" = $1 OR "categoryId" IS NULL) ORDER BY "order" ASC';
      params.push(categoryId);
    } else {
      query += ' ORDER BY "order" ASC';
    }

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[PARAMETERS_GET]", error);
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
      unit = null,
      type = "text",
      options = null,
      required = false,
      order = 0,
    } = body;

    if (!key || !label) {
      return NextResponse.json(
        { error: "Missing key or label" },
        { status: 400 },
      );
    }

    const insert = await pool.query(
      'INSERT INTO "ParameterDefinition" (id, "categoryId", key, label, unit, type, options, required, "order", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id, "categoryId", key, label, unit, type, options, required, "order", "createdAt", "updatedAt"',
      [
        categoryId,
        key,
        label,
        unit,
        type,
        options ? JSON.stringify(options) : null,
        required,
        order,
      ],
    );

    return NextResponse.json(insert.rows[0], { status: 201 });
  } catch (error) {
    console.error("[PARAMETERS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
