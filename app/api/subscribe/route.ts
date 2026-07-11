import { NextResponse } from "next/server";

/**
 * Subscription endpoint — accepts email + layer preferences.
 * Stub implementation: logs to console, returns success.
 * Replace with a real email provider (Resend, Mailchimp, etc.) as needed.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, layers } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    // TODO: integrate with your email provider here.
    console.log("[subscribe] New subscriber:", email, "layers:", layers);

    return NextResponse.json({
      message: "Transmission received. You are now on the intelligence feed.",
    });
  } catch {
    return NextResponse.json({ message: "Transmission failed. Please try again." }, { status: 500 });
  }
}
