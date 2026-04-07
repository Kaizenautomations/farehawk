import { createAdminClient } from "@/lib/supabase/admin";

const adminCache = new Map<string, { isAdmin: boolean; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a user is an admin. Admins get:
 * - Unlimited searches
 * - Unlimited AI messages
 * - Unlimited watches
 * - Access to /admin dashboard
 *
 * Results are cached in-memory for 5 minutes to avoid repeated Supabase calls.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const cached = adminCache.get(userId);
  if (cached && cached.expires > Date.now()) {
    return cached.isAdmin;
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  const result = data?.is_admin === true;

  adminCache.set(userId, { isAdmin: result, expires: Date.now() + CACHE_TTL });
  return result;
}

/**
 * Admin tier limits — effectively unlimited
 */
export const ADMIN_LIMITS = {
  searches_per_day: 999999,
  max_watches: 999999,
  ai_messages_per_day: 999999,
  ai_model: "gpt-4o" as const,
  email_alerts: true,
  sms_alerts: true,
  business_cabin: true,
};
