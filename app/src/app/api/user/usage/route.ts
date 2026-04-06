import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS, type PlanTier } from "@/lib/constants";
import { isAdmin, ADMIN_LIMITS } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userIsAdmin = await isAdmin(user.id);

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .single();
  const tier: PlanTier = (sub?.tier as PlanTier) || "free";
  const limits = userIsAdmin ? ADMIN_LIMITS : TIER_LIMITS[tier];

  const today = new Date().toISOString().split("T")[0];
  const { data: usage } = await supabase
    .from("daily_usage")
    .select("search_count, ai_message_count")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  const { count: watchCount } = await supabase
    .from("watches")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  return NextResponse.json({
    tier: userIsAdmin ? "admin" : tier,
    is_admin: userIsAdmin,
    searches_used: usage?.search_count ?? 0,
    searches_limit: limits.searches_per_day,
    watches_used: watchCount ?? 0,
    watches_limit: limits.max_watches,
    ai_messages_used: usage?.ai_message_count ?? 0,
    ai_messages_limit: limits.ai_messages_per_day,
    email_alerts: limits.email_alerts,
    sms_alerts: limits.sms_alerts,
    business_cabin: limits.business_cabin,
  });
}
