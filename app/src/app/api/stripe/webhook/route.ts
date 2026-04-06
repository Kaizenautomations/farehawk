import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRICE_TO_TIER } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = event.data.object as any;

  switch (event.type) {
    case "checkout.session.completed": {
      const userId = obj.metadata?.user_id;
      if (!userId || !obj.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        obj.subscription as string
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = subscription as any;
      const priceId = sub.items?.data?.[0]?.price?.id;
      const tier = PRICE_TO_TIER[priceId] || "pro";

      await admin
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            tier,
            stripe_subscription_id: sub.id,
            stripe_price_id: priceId,
            status: "active",
            current_period_start: sub.current_period_start
              ? new Date(sub.current_period_start * 1000).toISOString()
              : null,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      break;
    }

    case "customer.subscription.updated": {
      const priceId = obj.items?.data?.[0]?.price?.id;
      const tier = PRICE_TO_TIER[priceId] || "free";

      await admin
        .from("subscriptions")
        .update({
          tier,
          stripe_price_id: priceId,
          status: obj.status === "active" ? "active" : "past_due",
          current_period_start: obj.current_period_start
            ? new Date(obj.current_period_start * 1000).toISOString()
            : null,
          current_period_end: obj.current_period_end
            ? new Date(obj.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: obj.cancel_at_period_end ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", obj.id);
      break;
    }

    case "customer.subscription.deleted": {
      const { data: subRecord } = await admin
        .from("subscriptions")
        .update({
          tier: "free",
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", obj.id)
        .select("user_id")
        .single();

      if (subRecord?.user_id) {
        const { data: watches } = await admin
          .from("watches")
          .select("id")
          .eq("user_id", subRecord.user_id)
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (watches && watches.length > 1) {
          const idsToDeactivate = watches.slice(1).map((w) => w.id);
          await admin
            .from("watches")
            .update({ is_active: false })
            .in("id", idsToDeactivate);
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      if (obj.subscription) {
        await admin
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", obj.subscription as string);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
