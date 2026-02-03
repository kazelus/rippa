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
      tls: cfg.allowSelfSigned ? { rejectUnauthorized: false } : undefined,
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
      .map((s) => s.trim())
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
    const subject = `Nowe zgłoszenie kontaktowe — ${submission.name}${topicLabel ? ` — ${topicLabel}` : ""}`;
    const text = `Nowe zgłoszenie kontaktowe:\n\nImię: ${submission.name}\nEmail: ${submission.email}\nTelefon: ${submission.phone || "-"}\n${topicPart}${productPart}\nWiadomość:\n${submission.message}\n\nData: ${new Date(submission.createdAt).toLocaleString()}`;
    const html = `<p>Nowe zgłoszenie kontaktowe:</p>
      <ul>
        <li><strong>Imię:</strong> ${submission.name}</li>
        <li><strong>Email:</strong> ${submission.email}</li>
        <li><strong>Telefon:</strong> ${submission.phone || "-"}</li>
        ${topicLabel ? `<li><strong>Temat:</strong> ${topicLabel}</li>` : ""}
        ${submission.product?.name ? `<li><strong>Produkt:</strong> ${submission.product.name}</li>` : ""}
      </ul>
      <p><strong>Wiadomość:</strong></p>
      <p>${submission.message.replace(/\n/g, "<br />")}</p>
      <p style=\"color:#6b7280;font-size:12px;\">Data: ${new Date(submission.createdAt).toLocaleString()}</p>`;

    return await sendMail({ to: emails, subject, text, html });
  } catch (err: any) {
    console.error("Error in sendContactNotification", err);
    return { ok: false, reason: err };
  }
}
