import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
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
  if (!userIsAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Total users
  const { count: totalUsers } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Users by tier
  const { data: tierData } = await admin
    .from("subscriptions")
    .select("tier");
  const tierCounts = { free: 0, pro: 0, premium: 0 };
  tierData?.forEach((s) => {
    const t = s.tier as keyof typeof tierCounts;
    if (tierCounts[t] !== undefined) tierCounts[t]++;
  });

  // Total watches
  const { count: totalWatches } = await admin
    .from("watches")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Today's searches
  const today = new Date().toISOString().split("T")[0];
  const { data: usageData } = await admin
    .from("daily_usage")
    .select("search_count, ai_message_count")
    .eq("date", today);
  const todaySearches =
    usageData?.reduce((sum, u) => sum + (u.search_count || 0), 0) ?? 0;
  const todayAiMessages =
    usageData?.reduce((sum, u) => sum + (u.ai_message_count || 0), 0) ?? 0;

  // Total price snapshots (indicator of monitoring volume)
  const { count: totalSnapshots } = await admin
    .from("price_snapshots")
    .select("*", { count: "exact", head: true });

  // Recent signups (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: recentSignups } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  // Waitlist count
  const { count: waitlistCount } = await admin
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  // Waitlist entries
  const { data: waitlistEntries } = await admin
    .from("waitlist")
    .select("id, email, name, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  // All users list
  const { data: users } = await admin
    .from("profiles")
    .select(
      "id, email, full_name, is_admin, created_at, home_airports, subscriptions(tier, status)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    stats: {
      total_users: totalUsers ?? 0,
      tier_breakdown: tierCounts,
      active_watches: totalWatches ?? 0,
      today_searches: todaySearches,
      today_ai_messages: todayAiMessages,
      total_price_snapshots: totalSnapshots ?? 0,
      recent_signups_7d: recentSignups ?? 0,
      waitlist_count: waitlistCount ?? 0,
    },
    users:
      users?.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.full_name,
        is_admin: u.is_admin,
        created_at: u.created_at,
        home_airports: u.home_airports,
        tier:
          (u.subscriptions as unknown as { tier: string; status: string }[])?.[0]
            ?.tier ?? "free",
        status:
          (u.subscriptions as unknown as { tier: string; status: string }[])?.[0]
            ?.status ?? "active",
      })) ?? [],
    waitlist:
      waitlistEntries?.map((w) => ({
        id: w.id,
        email: w.email,
        name: w.name,
        created_at: w.created_at,
      })) ?? [],
  });
}
