import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/mailer";

interface QuoteRequest {
  productId?: string;
  productName?: string;
  topic?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres email" },
        { status: 400 },
      );
    }

    // If a productId was provided, verify it exists to avoid FK errors
    let productIdToSave: string | null = null;
    if (body.productId) {
      try {
        const m = await prisma.model.findUnique({
          where: { id: body.productId },
        });
        if (m) productIdToSave = body.productId;
        else
          console.warn(
            `Quote: productId ${body.productId} not found, saving submission without productId`,
          );
      } catch (e) {
        console.warn("Error checking productId", e);
      }
    }

    // Save submission to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        message: body.message,
        productId: productIdToSave,
      },
    });

    // Send notification email (best-effort) and include result in response for debugging
    let mailResult: any = null;
    try {
      const full = await prisma.contactSubmission.findUnique({
        where: { id: submission.id },
        include: { product: { select: { id: true, name: true } } },
      });
      if (full) {
        // pass topic from request into the notification (DB schema may not have topic yet)
        const withTopic = { ...full, topic: body.topic || null } as any;
        mailResult = await sendContactNotification(withTopic);
      }
    } catch (e) {
      console.warn("Failed to send contact notification", e);
      mailResult = { ok: false, reason: e };
    }

    return NextResponse.json(
      {
        success: true,
        id: submission.id,
        message:
          "Zapytanie zostało zapisane. Wkrótce się z Tobą skontaktujemy.",
        mailResult,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting quote:", error);
    return NextResponse.json(
      { error: "Błąd przy przetwarzaniu zapytania" },
      { status: 500 },
    );
  }
}
