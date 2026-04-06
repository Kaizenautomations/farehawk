import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exploreAnywhere } from "@/lib/sidecar";
import { TIER_LIMITS, type PlanTier } from "@/lib/constants";
import { NextResponse } from "next/server";
import crypto from "crypto";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user tier
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .single();
  const tier: PlanTier = (sub?.tier as PlanTier) || "free";
  const limits = TIER_LIMITS[tier];

  // Check rate limit (counts as 1 search)
  const admin = createAdminClient();
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

  const body = await request.json();

  // Check cache (6-hour TTL for explore)
  const cacheKey = crypto
    .createHash("md5")
    .update(JSON.stringify({ ...body, _type: "explore" }))
    .digest("hex");
  const { data: cached } = await admin
    .from("search_cache")
    .select("results, created_at")
    .eq("cache_key", cacheKey)
    .single();

  if (cached) {
    const cacheAge = Date.now() - new Date(cached.created_at).getTime();
    if (cacheAge < SIX_HOURS_MS) {
      return NextResponse.json(cached.results);
    }
  }

  // Call sidecar
  try {
    const results = await exploreAnywhere(body);

    // Cache results
    await admin.from("search_cache").upsert(
      { cache_key: cacheKey, results, created_at: new Date().toISOString() },
      { onConflict: "cache_key" }
    );

    return NextResponse.json(results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Explore failed";
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
