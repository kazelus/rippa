import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Create new chat session or add message
export async function POST(req: NextRequest) {
  const { sessionId, content, sender, phone } = await req.json();
  let session;
  if (!sessionId) {
    // New session
    session = await prisma.chatSession.create({
      data: { phone, messages: { create: { content, sender } } },
      include: { messages: true },
    });
  } else {
    // Existing session
    session = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { messages: { create: { content, sender } } },
      include: { messages: true },
    });
  }
  return NextResponse.json(session);
}

// GET: Get chat session by id (with messages)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId)
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: { messages: true },
  });
  if (!session)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(session);
}
