import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: return configured contact emails (comma-separated)
export async function GET() {
  const setting = await prisma.settings.findUnique({
    where: { key: "contact_emails" },
  });
  return NextResponse.json({ emails: setting?.value || "" });
}

// POST: update contact emails
export async function POST(req: NextRequest) {
  try {
    const { emails } = await req.json();
    if (typeof emails !== "string")
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    const setting = await prisma.settings.upsert({
      where: { key: "contact_emails" },
      create: { key: "contact_emails", value: emails },
      update: { value: emails },
    });
    return NextResponse.json({ emails: setting.value });
  } catch (err) {
    console.error("Error saving contact emails", err);
    return NextResponse.json({ error: "Błąd" }, { status: 500 });
  }
}
