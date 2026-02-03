import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Pobierz numer WhatsApp
export async function GET() {
  const setting = await prisma.settings.findUnique({
    where: { key: "whatsapp_number" },
  });
  return NextResponse.json({ number: setting?.value || "" });
}

// POST: Ustaw numer WhatsApp
export async function POST(req: NextRequest) {
  const { number } = await req.json();
  if (!number)
    return NextResponse.json({ error: "Brak numeru" }, { status: 400 });
  const setting = await prisma.settings.upsert({
    where: { key: "whatsapp_number" },
    update: { value: number },
    create: { key: "whatsapp_number", value: number },
  });
  return NextResponse.json({ number: setting.value });
}
