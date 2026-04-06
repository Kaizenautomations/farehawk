-- No extensions needed — gen_random_uuid() is built-in

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  home_airports text[] default '{}',
  notification_email boolean default true,
  notification_sms boolean default false,
  phone text,
  stripe_customer_id text unique,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create type public.plan_tier as enum ('free', 'pro', 'premium');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tier public.plan_tier default 'free',
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- USAGE TRACKING
-- ============================================================
create table public.daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  search_count integer default 0,
  ai_message_count integer default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- ============================================================
-- PRICE WATCHES
-- ============================================================
create table public.watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  origin text not null,
  destination text not null,
  departure_date date not null,
  return_date date,
  cabin_class text default 'economy',
  max_stops integer,
  target_price numeric(10,2),
  current_price numeric(10,2),
  lowest_price numeric(10,2),
  is_active boolean default true,
  last_checked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PRICE SNAPSHOTS
-- ============================================================
create table public.price_snapshots (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid not null references public.watches(id) on delete cascade,
  price numeric(10,2) not null,
  currency text default 'USD',
  checked_at timestamptz default now()
);

create index idx_price_snapshots_watch_time on public.price_snapshots(watch_id, checked_at desc);

-- ============================================================
-- SEARCH CACHE
-- ============================================================
create table public.search_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text unique not null,
  results jsonb not null,
  created_at timestamptz default now()
);

create index idx_search_cache_key on public.search_cache(cache_key);

-- ============================================================
-- NOTIFICATIONS LOG
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  watch_id uuid references public.watches(id) on delete set null,
  type text not null,
  channel text not null,
  subject text,
  body text,
  sent_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.daily_usage enable row level security;
alter table public.watches enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.notifications enable row level security;
alter table public.search_cache enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Subscriptions
create policy "Users can view own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

-- Daily usage
create policy "Users can view own usage"
  on public.daily_usage for select using (auth.uid() = user_id);

-- Watches
create policy "Users can view own watches"
  on public.watches for select using (auth.uid() = user_id);
create policy "Users can create watches"
  on public.watches for insert with check (auth.uid() = user_id);
create policy "Users can update own watches"
  on public.watches for update using (auth.uid() = user_id);
create policy "Users can delete own watches"
  on public.watches for delete using (auth.uid() = user_id);

-- Price snapshots
create policy "Users can view own watch snapshots"
  on public.price_snapshots for select using (
    exists (select 1 from public.watches w where w.id = watch_id and w.user_id = auth.uid())
  );

-- Notifications
create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

-- Search cache: service role only
create policy "Service role only for cache"
  on public.search_cache for all using (false);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  insert into public.subscriptions (user_id, tier, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Increment search count atomically
create or replace function public.increment_search_count(p_user_id uuid)
returns integer as $$
declare
  v_count integer;
begin
  insert into public.daily_usage (user_id, date, search_count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, date)
  do update set search_count = daily_usage.search_count + 1
  returning search_count into v_count;
  return v_count;
end;
$$ language plpgsql security definer;

-- Cleanup stale cache
create or replace function public.cleanup_search_cache()
returns void as $$
begin
  delete from public.search_cache
  where created_at < now() - interval '30 minutes';
end;
$$ language plpgsql security definer;
