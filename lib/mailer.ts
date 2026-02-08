import nodemailer from "nodemailer";
import { prisma } from "./prisma";

type MailOptions = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

async function getSMTPConfig() {
  // Try to read SMTP/SendGrid settings from database
  const keys = [
    "smtp_host",
    "smtp_port",
    "smtp_user",
    "smtp_pass",
    "smtp_secure",
    "smtp_from",
    "smtp_provider",
    "sendgrid_api_key",
    "smtp_allow_self_signed",
  ];
  const settings = await prisma.settings.findMany({
    where: { key: { in: keys } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = (s.value || "").toString().trim();

  // Environment override: SENDGRID_API_KEY
  if (process.env.SENDGRID_API_KEY || map["sendgrid_api_key"]) {
    const apiKey = (process.env.SENDGRID_API_KEY || map["sendgrid_api_key"])
      .toString()
      .trim();
    return {
      provider: "sendgrid",
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: { user: "apikey", pass: apiKey },
      from:
        map["smtp_from"] ||
        `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || "example.com"}`,
      allowSelfSigned:
        process.env.SMTP_ALLOW_SELF_SIGNED === "1" ||
        process.env.SMTP_ALLOW_SELF_SIGNED === "true" ||
        map["smtp_allow_self_signed"] === "true",
    } as any;
  }

  if (map["smtp_host"] && map["smtp_port"]) {
    return {
      provider: map["smtp_provider"] || "smtp",
      host: map["smtp_host"],
      port: Number(map["smtp_port"]) || 587,
      secure: map["smtp_secure"] === "true",
      auth: map["smtp_user"]
        ? { user: map["smtp_user"], pass: map["smtp_pass"] }
        : undefined,
      from:
        map["smtp_from"] ||
        `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || "example.com"}`,
      allowSelfSigned:
        process.env.SMTP_ALLOW_SELF_SIGNED === "1" ||
        process.env.SMTP_ALLOW_SELF_SIGNED === "true" ||
        map["smtp_allow_self_signed"] === "true",
    } as any;
  }

  // No config
  return null;
}

export async function sendMail(opts: MailOptions) {
  try {
    const cfg = await getSMTPConfig();
    if (!cfg) {
      console.warn("No SMTP/SendGrid config found — email not sent", opts.to);
      return { ok: false, reason: "no-config" };
    }

    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.auth,
      tls: { rejectUnauthorized: false },
    });

    const from = opts.from || cfg.from;
    const recipients = Array.isArray(opts.to) ? opts.to.join(", ") : opts.to;

    const info = await transporter.sendMail({
      from,
      to: recipients,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });

    // Log details for debugging (useful in dev)
    try {
      console.log("Mail sent:", {
        to: recipients,
        subject: opts.subject,
        messageId: info?.messageId,
      });
    } catch (e: any) {
      // ignore logging errors
    }

    return { ok: true, info };
  } catch (err: any) {
    console.error("Error sending mail", {
      message: err?.message ?? err,
      code: err?.code,
      stack: err?.stack,
    });
    return { ok: false, reason: err };
  }
}

export async function sendContactNotification(submission: any) {
  try {
    // Get configured contact recipient emails
    const setting = await prisma.settings.findUnique({
      where: { key: "contact_emails" },
    });
    const emails = (setting?.value || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (emails.length === 0) {
      console.warn(
        "No contact recipient emails configured; skipping notification",
      );
      return { ok: false, reason: "no-recipients" };
    }

    const productPart = submission.product?.name
      ? `Produkt: ${submission.product.name}\n`
      : "";
    const topicMap: Record<string, string> = {
      offer: "Zapytanie o ofertę",
      service: "Serwis i części",
      partnership: "Współpraca",
      other: "Inne",
    };
    const topicLabel = submission.topic
      ? topicMap[submission.topic] || submission.topic
      : null;
    const topicPart = topicLabel ? `Temat: ${topicLabel}\n` : "";

    // Build configuration summary
    const configHtml = buildConfigHtml(submission.configuration);
    const configText = buildConfigText(submission.configuration);

    const subject = `Nowe zgłoszenie kontaktowe — ${submission.name}${topicLabel ? ` — ${topicLabel}` : ""}`;
    const text = `Nowe zgłoszenie kontaktowe:\n\nImię: ${submission.name}\nEmail: ${submission.email}\nTelefon: ${submission.phone || "-"}\n${topicPart}${productPart}${configText}\nWiadomość:\n${submission.message}\n\nData: ${new Date(submission.createdAt).toLocaleString()}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:24px;border-radius:12px;">
        <div style="background:#1b3caf;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:20px;">🔔 Nowe zgłoszenie kontaktowe</h1>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;width:120px;vertical-align:top;">Imię:</td><td style="padding:8px 0;font-weight:600;">${submission.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Email:</td><td style="padding:8px 0;"><a href="mailto:${submission.email}" style="color:#1b3caf;">${submission.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Telefon:</td><td style="padding:8px 0;">${submission.phone || "—"}</td></tr>
            ${topicLabel ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Temat:</td><td style="padding:8px 0;">${topicLabel}</td></tr>` : ""}
            ${submission.product?.name ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Produkt:</td><td style="padding:8px 0;font-weight:600;">${submission.product.name}</td></tr>` : ""}
          </table>
          ${configHtml}
          <div style="margin-top:16px;padding:16px;background:#f3f4f6;border-radius:8px;">
            <p style="margin:0 0 8px;font-weight:600;color:#374151;">Wiadomość:</p>
            <p style="margin:0;color:#4b5563;white-space:pre-wrap;">${submission.message.replace(/\n/g, "<br />")}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin-top:16px;">Data: ${new Date(submission.createdAt).toLocaleString("pl-PL")}</p>
        </div>
      </div>`;

    return await sendMail({ to: emails, subject, text, html });
  } catch (err: any) {
    console.error("Error in sendContactNotification", err);
    return { ok: false, reason: err };
  }
}

/**
 * Send confirmation email to the customer who submitted the form.
 */
export async function sendCustomerConfirmation(submission: any) {
  try {
    if (!submission.email) {
      return { ok: false, reason: "no-customer-email" };
    }

    const topicMap: Record<string, string> = {
      offer: "Zapytanie o ofertę",
      service: "Serwis i części",
      partnership: "Współpraca",
      other: "Inne",
    };
    const topicLabel = submission.topic
      ? topicMap[submission.topic] || submission.topic
      : null;

    const configHtml = buildConfigHtml(submission.configuration);
    const productName =
      submission.product?.name || submission.productName || null;

    const subject = productName
      ? `Potwierdzenie zapytania — ${productName} — Rippa Polska`
      : "Potwierdzenie zapytania — Rippa Polska";

    const text = `Cześć ${submission.name},\n\nDziękujemy za Twoje zapytanie! Otrzymaliśmy Twoją wiadomość i skontaktujemy się z Tobą najszybciej jak to możliwe.\n\n${productName ? `Produkt: ${productName}\n` : ""}${topicLabel ? `Temat: ${topicLabel}\n` : ""}${buildConfigText(submission.configuration)}\nTwoja wiadomość:\n${submission.message}\n\n---\nRippa Polska\nSadowa 1, 34-120 Sułkowice\nTel: +48 787 148 016\nEmail: biuro@rippapolska.pl`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:24px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#1b3caf,#0f9fdf);padding:24px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Rippa Polska</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Potwierdzenie zapytania</p>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p style="font-size:16px;color:#1f2937;">Cześć <strong>${submission.name}</strong>,</p>
          <p style="color:#4b5563;line-height:1.6;">
            Dziękujemy za Twoje zapytanie! Otrzymaliśmy Twoją wiadomość i skontaktujemy się z Tobą 
            <strong>w ciągu 24 godzin</strong> w dni robocze.
          </p>

          ${
            productName
              ? `
          <div style="margin:20px 0;padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
            <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Produkt</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#1e40af;">${productName}</p>
          </div>`
              : ""
          }

          ${configHtml}

          <div style="margin:20px 0;padding:16px;background:#f3f4f6;border-radius:8px;">
            <p style="margin:0 0 8px;font-weight:600;color:#374151;font-size:13px;">Twoja wiadomość:</p>
            <p style="margin:0;color:#4b5563;white-space:pre-wrap;font-size:14px;">${submission.message.replace(/\n/g, "<br />")}</p>
          </div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

          <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
            Jeśli masz pilne pytanie, zadzwoń do nas: 
            <a href="tel:+48787148016" style="color:#1b3caf;font-weight:600;">+48 787 148 016</a><br />
            Pon – Pt: 8:00 – 16:00
          </p>

          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-weight:600;color:#1f2937;">Rippa Polska</p>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">Sadowa 1, 34-120 Sułkowice · biuro@rippapolska.pl</p>
          </div>
        </div>
      </div>`;

    return await sendMail({
      to: submission.email,
      subject,
      text,
      html,
    });
  } catch (err: any) {
    console.error("Error in sendCustomerConfirmation", err);
    return { ok: false, reason: err };
  }
}

// Helper: build configuration section for HTML emails
function buildConfigHtml(configuration?: any): string {
  if (!configuration) return "";
  const { variants, quickSpecs, totalPrice } = configuration;
  const hasContent =
    (variants && variants.length > 0) ||
    (quickSpecs && quickSpecs.length > 0) ||
    totalPrice;
  if (!hasContent) return "";

  let html = `<div style="margin:20px 0;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
    <p style="margin:0 0 12px;font-weight:700;color:#166534;font-size:14px;">📋 Konfiguracja modelu</p>`;

  if (variants && variants.length > 0) {
    html += `<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">`;
    for (const v of variants) {
      html += `<tr>
        <td style="padding:4px 0;color:#6b7280;font-size:13px;">${v.groupName}:</td>
        <td style="padding:4px 0;font-weight:600;font-size:13px;color:#1f2937;">${v.optionName}${v.priceModifier ? ` <span style="color:#0f9fdf;">(+${v.priceModifier} PLN)</span>` : ""}</td>
      </tr>`;
    }
    html += `</table>`;
  }

  if (quickSpecs && quickSpecs.length > 0) {
    html += `<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">`;
    for (const qs of quickSpecs) {
      html += `<tr>
        <td style="padding:3px 0;color:#6b7280;font-size:13px;">${qs.label}:</td>
        <td style="padding:3px 0;font-size:13px;color:#1f2937;">${qs.value}${qs.unit ? ` ${qs.unit}` : ""}</td>
      </tr>`;
    }
    html += `</table>`;
  }

  if (totalPrice) {
    html += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #bbf7d0;">
      <span style="color:#6b7280;font-size:13px;">Cena konfiguracji:</span>
      <span style="font-weight:700;font-size:15px;color:#166534;margin-left:8px;">${totalPrice}</span>
    </div>`;
  }

  html += `</div>`;
  return html;
}

// Helper: build configuration section for plain-text emails
function buildConfigText(configuration?: any): string {
  if (!configuration) return "";
  const { variants, quickSpecs, totalPrice } = configuration;
  const hasContent =
    (variants && variants.length > 0) ||
    (quickSpecs && quickSpecs.length > 0) ||
    totalPrice;
  if (!hasContent) return "";

  let text = "\nKonfiguracja modelu:\n";

  if (variants && variants.length > 0) {
    for (const v of variants) {
      text += `  ${v.groupName}: ${v.optionName}${v.priceModifier ? ` (+${v.priceModifier} PLN)` : ""}\n`;
    }
  }

  if (quickSpecs && quickSpecs.length > 0) {
    for (const qs of quickSpecs) {
      text += `  ${qs.label}: ${qs.value}${qs.unit ? ` ${qs.unit}` : ""}\n`;
    }
  }

  if (totalPrice) {
    text += `  Cena konfiguracji: ${totalPrice}\n`;
  }

  return text + "\n";
}
