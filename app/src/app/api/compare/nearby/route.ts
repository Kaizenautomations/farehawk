import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { compareNearby } from "@/lib/sidecar";
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

  const body = await request.json();

  // Check cache (30-min TTL)
  const admin = createAdminClient();
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
