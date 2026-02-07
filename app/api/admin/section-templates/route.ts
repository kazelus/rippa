import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET all section templates
export async function GET() {
  try {
    const result = await db.query(
      `SELECT * FROM "SectionTemplate" ORDER BY "createdAt" DESC`,
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching section templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch section templates" },
      { status: 500 },
    );
  }
}

// POST create a new section template
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, title, text } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nazwa szablonu jest wymagana" },
        { status: 400 },
      );
    }

    const result = await db.query(
      `INSERT INTO "SectionTemplate" (name, title, text) VALUES ($1, $2, $3) RETURNING *`,
      [name, title || "", text || ""],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating section template:", error);
    return NextResponse.json(
      { error: "Failed to create section template" },
      { status: 500 },
    );
  }
}
