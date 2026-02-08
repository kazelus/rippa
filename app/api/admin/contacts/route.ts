import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: list contact submissions (admin)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const requestedPageSize = Number(url.searchParams.get("pageSize") || "20");
    const MAX_PAGE_SIZE = 100;
    const pageSize = Math.max(1, Math.min(requestedPageSize || 20, MAX_PAGE_SIZE));
    const unread = url.searchParams.get("unread");
    const where: any = {};
    if (unread === "1" || unread === "true") where.read = false;

    const total = await prisma.contactSubmission.count({ where });
    // Select only metadata fields (no full message) to keep payload small
    const items = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Math.max(page, 1) - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        read: true,
        createdAt: true,
        topic: true,
        product: { select: { id: true, name: true } },
      },
    });

    const res = NextResponse.json({ items, total, page, pageSize });
    // Admin list pages can be cached in CDN for short time if appropriate
    res.headers.set("Cache-Control", "private, max-age=0, s-maxage=30, stale-while-revalidate=60");
    return res;
  } catch (err) {
    console.error("Error fetching contacts", err);
    return NextResponse.json({ error: "Błąd pobierania" }, { status: 500 });
  }
}

// DELETE: delete a submission by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Brak id" }, { status: 400 });
    await prisma.contactSubmission.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting contact", err);
    return NextResponse.json({ error: "Błąd usuwania" }, { status: 500 });
  }
}

// PATCH: mark as read/unread
export async function PATCH(req: NextRequest) {
  try {
    const { id, read } = await req.json();
    if (!id) return NextResponse.json({ error: "Brak id" }, { status: 400 });
    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: { read: !!read },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating contact", err);
    return NextResponse.json({ error: "Błąd aktualizacji" }, { status: 500 });
  }
}
