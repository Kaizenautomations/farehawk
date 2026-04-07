import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter: max 3 submissions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

// Periodic cleanup of expired entries (every 100 requests)
let requestCount = 0;
function maybeCleanup() {
  requestCount++;
  if (requestCount % 100 === 0) {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(ip);
      }
    }
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    maybeCleanup();

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

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
