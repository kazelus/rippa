import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Add faqs jsonb column if not exists
    await pool.query(`
      ALTER TABLE "Model" 
      ADD COLUMN IF NOT EXISTS "faqs" JSONB DEFAULT '[]'::jsonb;
    `);

    // Add availability text column if not exists
    await pool.query(`
      ALTER TABLE "Model" 
      ADD COLUMN IF NOT EXISTS "availability" TEXT DEFAULT 'Dostępne od ręki';
    `);

    return NextResponse.json({ message: "Database schema updated successfully! Columns 'faqs' and 'availability' are now present." });
  } catch (error: any) {
    console.error("Error updating database schema:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
