import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchDates } from "@/lib/sidecar";
import { TIER_LIMITS, type PlanTier } from "@/lib/constants";
import { isAdmin, ADMIN_LIMITS } from "@/lib/admin";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
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

  const admin = createAdminClient();
  if (!userIsAdmin) {
    const { data: countData } = await admin.rpc("increment_search_count", {
      p_user_id: user.id,
    });
    if (countData && countData > limits.searches_per_day) {
      return NextResponse.json(
        { error: "Daily search limit reached", limit: limits.searches_per_day, tier },
        { status: 429 }
      );
    }
  }

  const body = await request.json();

  const cacheKey = crypto
    .createHash("md5")
    .update(JSON.stringify({ ...body, type: "dates" }))
    .digest("hex");
  const { data: cached } = await admin
    .from("search_cache")
    .select("results")
    .eq("cache_key", cacheKey)
    .single();

  if (cached) {
    return NextResponse.json(cached.results);
  }

  try {
    const results = await searchDates(body);

    await admin.from("search_cache").upsert(
      { cache_key: cacheKey, results, created_at: new Date().toISOString() },
      { onConflict: "cache_key" }
    );

    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    const status = message.includes("429") ? 429 : 500;
    return NextResponse.json(
      {
        error:
          status === 429
            ? "Flight data is temporarily unavailable due to high demand. Please wait a moment and try again."
            : message,
        retryable: status === 429,
      },
      { status }
    );
  }
}
