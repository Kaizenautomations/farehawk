import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { compareNearby } from "@/lib/sidecar";
import { TIER_LIMITS, type PlanTier } from "@/lib/constants";
import { isAdmin, ADMIN_LIMITS } from "@/lib/admin";
import { NextResponse } from "next/server";
import crypto from "crypto";

const THIRTY_MIN_MS = 30 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin status
  const userIsAdmin = await isAdmin(user.id);

  // Get user tier
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .single();
  const tier: PlanTier = (sub?.tier as PlanTier) || "free";
  const limits = userIsAdmin ? ADMIN_LIMITS : TIER_LIMITS[tier];

  // Check rate limit (skip for admins)
  const admin = createAdminClient();
  if (!userIsAdmin) {
    const { data: countData } = await admin.rpc("increment_search_count", {
      p_user_id: user.id,
    });
    if (countData && countData > limits.searches_per_day) {
      return NextResponse.json(
        {
          error: "Daily search limit reached",
          limit: limits.searches_per_day,
          tier,
        },
        { status: 429 }
      );
    }
  }

  const body = await request.json();

  // Check cache (30-min TTL)
  const cacheKey = crypto
    .createHash("md5")
    .update(JSON.stringify({ ...body, _type: "nearby" }))
    .digest("hex");
  const { data: cached } = await admin
    .from("search_cache")
    .select("results, created_at")
    .eq("cache_key", cacheKey)
    .single();

  if (cached) {
    const cacheAge = Date.now() - new Date(cached.created_at).getTime();
    if (cacheAge < THIRTY_MIN_MS) {
      return NextResponse.json(cached.results);
    }
  }

  // Call sidecar (no rate limiting — piggybacks on existing search)
  try {
    const results = await compareNearby(body);

    // Cache results
    await admin.from("search_cache").upsert(
      { cache_key: cacheKey, results, created_at: new Date().toISOString() },
      { onConflict: "cache_key" }
    );

    return NextResponse.json(results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Comparison failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
