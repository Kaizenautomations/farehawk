export const TIER_LIMITS = {
  free: {
    searches_per_day: 3,
    max_watches: 1,
    email_alerts: false,
    sms_alerts: false,
    business_cabin: false,
    ai_messages_per_day: 0,
    ai_model: null,
  },
  pro: {
    searches_per_day: 50,
    max_watches: 10,
    email_alerts: true,
    sms_alerts: false,
    business_cabin: false,
    ai_messages_per_day: 15,
    ai_model: "gpt-4o-mini",
  },
  premium: {
    searches_per_day: 200,
    max_watches: 50,
    email_alerts: true,
    sms_alerts: true,
    business_cabin: true,
    ai_messages_per_day: 50,
    ai_model: "gpt-4o",
  },
} as const;

export type PlanTier = keyof typeof TIER_LIMITS;

export const PRICE_TO_TIER: Record<string, PlanTier> = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY ?? "price_pro_monthly"]: "pro",
  [process.env.STRIPE_PRICE_PRO_YEARLY ?? "price_pro_yearly"]: "pro",
  [process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "price_premium_monthly"]:
    "premium",
  [process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? "price_premium_yearly"]:
    "premium",
};

export const CABIN_OPTIONS = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
] as const;

export const STOPS_OPTIONS = [
  { value: "", label: "Any stops" },
  { value: "0", label: "Nonstop only" },
  { value: "1", label: "1 stop or fewer" },
  { value: "2", label: "2 stops or fewer" },
] as const;
