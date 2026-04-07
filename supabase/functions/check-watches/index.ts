import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SIDECAR_URL = Deno.env.get("SIDECAR_URL")!;
const SIDECAR_API_KEY = Deno.env.get("SIDECAR_API_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function searchCheapest(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | null,
  cabinClass: string,
  maxStops: number | null
) {
  const res = await fetch(`${SIDECAR_URL}/search/flights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": SIDECAR_API_KEY,
    },
    body: JSON.stringify({
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate,
      cabin_class: cabinClass,
      max_stops: maxStops,
      sort_by: "cheapest",
      top_n: 1,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

async function sendEmail(to: string, subject: string, html: string) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "FareFlight <alerts@fareflight.ca>",
      to,
      subject,
      html,
    }),
  });
}

Deno.serve(async () => {
  const today = new Date().toISOString().split("T")[0];

  // Get active watches with future departure dates
  const { data: watches } = await supabase
    .from("watches")
    .select(
      `*, profiles!inner(email, notification_email), subscriptions!inner(tier)`
    )
    .eq("is_active", true)
    .gt("departure_date", today)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(100);

  if (!watches || watches.length === 0) {
    return new Response(JSON.stringify({ checked: 0 }));
  }

  let checked = 0;
  let alerts = 0;

  for (const watch of watches) {
    try {
      // Rate limit: 150ms between calls
      if (checked > 0) {
        await new Promise((r) => setTimeout(r, 150));
      }

      const result = await searchCheapest(
        watch.origin,
        watch.destination,
        watch.departure_date,
        watch.return_date,
        watch.cabin_class,
        watch.max_stops
      );

      if (!result) {
        await supabase
          .from("watches")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", watch.id);
        checked++;
        continue;
      }

      const newPrice = result.price;
      const oldPrice = watch.current_price;
      const lowestPrice = watch.lowest_price
        ? Math.min(watch.lowest_price, newPrice)
        : newPrice;

      // Insert price snapshot
      await supabase.from("price_snapshots").insert({
        watch_id: watch.id,
        price: newPrice,
        currency: result.currency || "USD",
      });

      // Update watch
      await supabase
        .from("watches")
        .update({
          current_price: newPrice,
          lowest_price: lowestPrice,
          last_checked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", watch.id);

      // Check alert conditions
      const tier = watch.subscriptions?.tier;
      const canEmail =
        watch.profiles?.notification_email &&
        (tier === "pro" || tier === "premium");

      if (canEmail && watch.profiles?.email) {
        let shouldAlert = false;
        let subject = "";
        let html = "";

        // Target price reached
        if (watch.target_price && newPrice <= watch.target_price) {
          shouldAlert = true;
          subject = `Target price hit! ${watch.origin} → ${watch.destination} is now $${newPrice}`;
          html = `
            <h2>Your target price has been reached!</h2>
            <p><strong>${watch.origin} → ${watch.destination}</strong></p>
            <p>Your target: $${watch.target_price} | Current: <strong>$${newPrice}</strong></p>
            <p>Departure: ${watch.departure_date}</p>
            <p><a href="${result.booking_url}">Book on Google Flights</a></p>
          `;
        }
        // Price dropped >15%
        else if (oldPrice && newPrice < oldPrice * 0.85) {
          shouldAlert = true;
          const savings = (oldPrice - newPrice).toFixed(0);
          const pctDrop = (
            ((oldPrice - newPrice) / oldPrice) *
            100
          ).toFixed(0);
          subject = `${watch.origin} → ${watch.destination} dropped to $${newPrice} (-${pctDrop}%)`;
          html = `
            <h2>Price drop alert!</h2>
            <p><strong>${watch.origin} → ${watch.destination}</strong></p>
            <p>Was: $${oldPrice} → Now: <strong>$${newPrice}</strong> (Save $${savings})</p>
            <p>Departure: ${watch.departure_date}</p>
            <p><a href="${result.booking_url}">Book on Google Flights</a></p>
          `;
        }

        if (shouldAlert) {
          await sendEmail(watch.profiles.email, subject, html);

          await supabase.from("notifications").insert({
            user_id: watch.user_id,
            watch_id: watch.id,
            type: watch.target_price && newPrice <= watch.target_price
              ? "target_reached"
              : "price_drop",
            channel: "email",
            subject,
          });

          alerts++;
        }
      }

      checked++;
    } catch (err) {
      console.error(`Error checking watch ${watch.id}:`, err);
      checked++;
    }
  }

  // Deactivate expired watches
  await supabase
    .from("watches")
    .update({ is_active: false })
    .lt("departure_date", today);

  // Clean old snapshots (>90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  await supabase
    .from("price_snapshots")
    .delete()
    .lt("checked_at", ninetyDaysAgo.toISOString());

  return new Response(
    JSON.stringify({ checked, alerts }),
    { headers: { "Content-Type": "application/json" } }
  );
});
