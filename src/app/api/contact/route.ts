import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { SITE } from "@/lib/constants";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, status: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  // Server-side validation — never trust the client.
  if (!name || !message || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { data: null, status: false, error: "Please provide a name, a valid email, and a message." },
      { status: 422 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.error("Contact form not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL.");
    return NextResponse.json(
      { data: null, status: false, error: "The contact form isn't configured yet." },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `${SITE.brand} <${from}>`,
      to: [to],
      replyTo: email,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { data: null, status: false, error: "Failed to send message." },
        { status: 502 },
      );
    }

    return NextResponse.json({ data: { sent: true }, status: true, error: null }, { status: 200 });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { data: null, status: false, error: "Failed to send message." },
      { status: 500 },
    );
  }
}
