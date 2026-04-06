import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Check if a user is an admin. Admins get:
 * - Unlimited searches
 * - Unlimited AI messages
 * - Unlimited watches
 * - Access to /admin dashboard
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return data?.is_admin === true;
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
