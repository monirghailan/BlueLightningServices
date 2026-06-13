import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validations/contact";
import { isRateLimited } from "@/lib/rate-limit";
import { site } from "@/lib/content";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid form data." },
      { status: 400 }
    );
  }

  const { name, email, company, phone, message, source } = parsed.data;
  const timestamp = new Date().toISOString();

  const emailPromise = sendEmail({ name, email, company, phone, message, source, timestamp });
  const sheetPromise = appendToSheet({ name, email, company, phone, message, source, timestamp });

  const [emailResult, sheetResult] = await Promise.allSettled([emailPromise, sheetPromise]);

  if (emailResult.status === "rejected") {
    console.error("Email send failed:", emailResult.reason);
  }
  if (sheetResult.status === "rejected") {
    console.error("Sheet append failed:", sheetResult.reason);
  }

  if (emailResult.status === "rejected" && sheetResult.status === "rejected") {
    return NextResponse.json(
      { error: "Unable to submit your message. Please email us directly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

async function sendEmail(data: {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message: string;
  source?: string;
  timestamp: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL || "Blue Lightning Services <onboarding@resend.dev>",
    to,
    replyTo: data.email,
    subject: `New lead — ${data.company} — ${site.name}`,
    text: [
      `New contact form submission`,
      ``,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Company: ${data.company}`,
      `Phone: ${data.phone || "Not provided"}`,
      `Source: ${data.source || "contact"}`,
      `Submitted: ${data.timestamp}`,
      ``,
      `Message:`,
      data.message,
    ].join("\n"),
  });
}

async function appendToSheet(data: {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message: string;
  source?: string;
  timestamp: string;
}) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  const secret = process.env.CONTACT_WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.warn("GOOGLE_SHEET_WEBHOOK_URL not set — skipping sheet append");
    return;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, secret, status: "New" }),
  });

  if (!res.ok) {
    throw new Error(`Sheet webhook failed: ${res.status}`);
  }
}
