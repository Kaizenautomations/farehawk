import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are FareHawk's AI Travel Advisor. You help users find cheap flights and plan trips.

You have access to real-time Google Flights data through FareHawk. When users ask about flights:
- Suggest specific routes, dates, and price expectations
- Recommend using the Search, Calendar, or Explore features
- Give tips on finding cheaper flights (flexible dates, nearby airports, off-peak travel)
- Be conversational, helpful, and concise
- Use specific airport codes (YEG, LAX, etc.)
- If you don't know exact current prices, say "Check the Search page for live prices"
- Keep responses under 200 words unless the user asks for detail

The user's home airport is likely in Canada or the US.`,
        messages: (history || []).concat([{ role: "user", content: message }]),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Anthropic API error:", response.status, errorData);
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data.content?.[0]?.text || "Sorry, I could not generate a response.";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Advisor error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
