import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendContactNotification,
  sendCustomerConfirmation,
} from "@/lib/mailer";

interface VariantConfig {
  groupName: string;
  optionName: string;
  priceModifier?: number;
}

interface QuickSpecConfig {
  label: string;
  value: string;
  unit?: string;
}

interface ModelConfiguration {
  variants?: VariantConfig[];
  quickSpecs?: QuickSpecConfig[];
  totalPrice?: string;
}

interface QuoteRequest {
  productId?: string;
  productName?: string;
  topic?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  configuration?: ModelConfiguration;
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

    // Prepare enriched submission for emails
    const full = await prisma.contactSubmission.findUnique({
      where: { id: submission.id },
      include: { product: { select: { id: true, name: true } } },
    });

    const enriched = {
      ...full,
      topic: body.topic || null,
      productName: body.productName || full?.product?.name || null,
      configuration: body.configuration || null,
    };

    // Send admin notification email (best-effort)
    let adminMailResult: any = null;
    try {
      if (enriched) {
        adminMailResult = await sendContactNotification(enriched);
      }
    } catch (e) {
      console.warn("Failed to send admin notification", e);
      adminMailResult = { ok: false, reason: String(e) };
    }

    // Send confirmation email to customer (best-effort)
    let customerMailResult: any = null;
    try {
      if (enriched) {
        customerMailResult = await sendCustomerConfirmation(enriched);
      }
    } catch (e) {
      console.warn("Failed to send customer confirmation", e);
      customerMailResult = { ok: false, reason: String(e) };
    }

    return NextResponse.json(
      {
        success: true,
        id: submission.id,
        message:
          "Zapytanie zostało zapisane. Wysłaliśmy potwierdzenie na Twój email.",
        mailResult: adminMailResult,
        customerMailResult,
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
