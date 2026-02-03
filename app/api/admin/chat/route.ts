import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Chat disabled" }, { status: 404 });
}
