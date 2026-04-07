import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, referral_code } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedReferral = typeof referral_code === "string" ? referral_code.trim() : null;

    const admin = createAdminClient();

    // Insert into waitlist table. If email already exists (unique constraint),
    // catch the conflict and return success anyway to avoid revealing if
    // the email is already registered.
    const { error } = await admin.from("waitlist").insert({
      email: trimmedEmail,
      name: trimmedName || null,
      ...(trimmedReferral ? { referral_code: trimmedReferral } : {}),
    });

    if (error) {
      // Unique constraint violation — email already on the waitlist
      if (error.code === "23505") {
        return NextResponse.json({ success: true });
      }
      console.error("[Waitlist] Insert error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Waitlist] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
