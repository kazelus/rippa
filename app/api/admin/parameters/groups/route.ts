import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();

    // Get distinct groups from ParameterDefinition where group is not null
    const result = await pool.query(
      'SELECT DISTINCT "group" FROM "ParameterDefinition" WHERE "group" IS NOT NULL ORDER BY "group" ASC',
    );

    const groups = result.rows.map((row) => row.group);
    return NextResponse.json(groups);
  } catch (error) {
    console.error("[PARAMETER_GROUPS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
