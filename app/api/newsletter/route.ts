import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/db";

/**
 * POST /api/newsletter
 *
 * A working endpoint with nowhere to go yet — replace the TODO with a
 * call to your email provider (Resend, Klaviyo, Mailchimp…) and the
 * form in the footer needs no changes.
 */
export async function POST(request: Request) {
  let email: unknown;

  try {
    ({ email } = (await request.json()) as { email?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 422 });
  }

  // TODO: forward to your email provider here.
  console.info(
    `[imt] private-view signup: ${email} (persisted: ${isDatabaseConfigured()})`,
  );

  return NextResponse.json({ ok: true });
}
