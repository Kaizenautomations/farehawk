import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TIER_LIMITS, type PlanTier } from "@/lib/constants";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are FareHawk's AI Travel Advisor. You help users find cheap flights and plan trips.

You have access to real-time Google Flights data through FareHawk. When users ask about flights:
- Suggest specific routes, dates, and price expectations
- Recommend using the Search, Calendar, or Explore features in the app
- Give tips on finding cheaper flights (flexible dates, nearby airports, off-peak travel)
- Be conversational, helpful, and concise
- Use specific airport codes (YEG, LAX, etc.)
- If you don't know exact current prices, say "Check the Search page for live prices"
- Keep responses under 150 words unless the user asks for detail
- Never make up specific prices — suggest checking the app

The user's home airport is likely in Canada or the US.`;

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

  // Check if tier has AI access
  if (!limits.ai_model || tier === "free") {
    return NextResponse.json(
      {
        error: "AI Travel Advisor requires a Pro or Premium plan.",
        upgrade: true,
      },
      { status: 403 }
    );
  }

  // Check daily AI message limit
  const admin = createAdminClient();
  const { data: countData } = await admin.rpc("increment_ai_message_count", {
    p_user_id: user.id,
  });

  if (countData && countData > limits.ai_messages_per_day) {
    return NextResponse.json(
      {
        error: `Daily AI message limit reached (${limits.ai_messages_per_day} for ${tier} plan). Resets at midnight UTC.`,
        limit_reached: true,
        limit: limits.ai_messages_per_day,
        tier,
      },
      { status: 429 }
    );
  }

  try {
    const { message, history } = (await request.json()) as {
      message: string;
      history: { role: string; content: string }[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const model = limits.ai_model;

    // Call OpenAI API
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 800,
          temperature: 0.7,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...(history || []).slice(-10),
            { role: "user", content: message },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", response.status, errorData);
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    return NextResponse.json({
      response: text,
      usage: {
        messages_used: countData,
        messages_limit: limits.ai_messages_per_day,
        model: tier === "premium" ? "GPT-4o" : "GPT-4o mini",
      },
    });
  } catch (error) {
    console.error("Advisor error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
