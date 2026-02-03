import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: List all chat sessions with last message
export async function GET() {
  const sessions = await prisma.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  return NextResponse.json(sessions);
}
