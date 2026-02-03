import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const keys = [
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_pass",
  "smtp_secure",
  "smtp_from",
  "sendgrid_api_key",
  "smtp_allow_self_signed",
];

export async function GET() {
  try {
    const rows = await prisma.settings.findMany({
      where: { key: { in: keys } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return NextResponse.json({ values: map });
  } catch (err) {
    console.error("Error fetching smtp settings", err);
    return NextResponse.json({ error: "Błąd" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body !== "object")
      return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const upserts = [] as any[];
    for (const k of keys) {
      if (k in body) {
        const raw = body[k] === null || body[k] === undefined ? "" : body[k];
        const v = String(raw).toString().trim();
        upserts.push(
          prisma.settings.upsert({
            where: { key: k },
            create: { key: k, value: v },
            update: { value: v },
          }),
        );
      }
    }

    await Promise.all(upserts);
    const rows = await prisma.settings.findMany({
      where: { key: { in: keys } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return NextResponse.json({ values: map });
  } catch (err) {
    console.error("Error saving smtp settings", err);
    return NextResponse.json({ error: "Błąd" }, { status: 500 });
  }
}
