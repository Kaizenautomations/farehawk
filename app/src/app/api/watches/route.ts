import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS, type PlanTier } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: watches, error } = await supabase
    .from("watches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(watches);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check tier limits
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .single();
  const tier: PlanTier = (sub?.tier as PlanTier) || "free";
  const limits = TIER_LIMITS[tier];

  const { count } = await supabase
    .from("watches")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if ((count ?? 0) >= limits.max_watches) {
    return NextResponse.json(
      {
        error: `Watch limit reached (${limits.max_watches} for ${tier} plan)`,
        limit: limits.max_watches,
        tier,
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { data: watch, error } = await supabase
    .from("watches")
    .insert({
      user_id: user.id,
      origin: body.origin,
      destination: body.destination,
      departure_date: body.departure_date,
      return_date: body.return_date || null,
      cabin_class: body.cabin_class || "economy",
      max_stops: body.max_stops ?? null,
      target_price: body.target_price ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(watch, { status: 201 });
}
