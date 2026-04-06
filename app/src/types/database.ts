export type PlanTier = "free" | "pro" | "premium";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  home_airports: string[];
  notification_email: boolean;
  notification_sms: boolean;
  phone: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: PlanTier;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Watch {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  cabin_class: string;
  max_stops: number | null;
  target_price: number | null;
  current_price: number | null;
  lowest_price: number | null;
  is_active: boolean;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceSnapshot {
  id: string;
  watch_id: string;
  price: number;
  currency: string;
  checked_at: string;
}

export interface DailyUsage {
  id: string;
  user_id: string;
  date: string;
  search_count: number;
}
