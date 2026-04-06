import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchFlights } from "@/lib/sidecar";
import { TIER_LIMITS, type PlanTier } from "@/lib/constants";
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

  // Get user tier
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .single();
  const tier: PlanTier = (sub?.tier as PlanTier) || "free";
  const limits = TIER_LIMITS[tier];

  // Check rate limit
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

  // Enforce cabin class restriction
  if (
    !limits.business_cabin &&
    (body.cabin_class === "business" || body.cabin_class === "first")
  ) {
    return NextResponse.json(
      { error: "Business/First class requires Premium plan" },
      { status: 403 }
    );
  }

  // Check cache
  const cacheKey = crypto
    .createHash("md5")
    .update(JSON.stringify(body))
    .digest("hex");
  const { data: cached } = await admin
    .from("search_cache")
    .select("results")
    .eq("cache_key", cacheKey)
    .single();

  if (cached) {
    return NextResponse.json(cached.results);
  }

  // Call sidecar
  try {
    const results = await searchFlights(body);

    // Cache results
    await admin.from("search_cache").upsert(
      { cache_key: cacheKey, results, created_at: new Date().toISOString() },
      { onConflict: "cache_key" }
    );

    return NextResponse.json(results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
