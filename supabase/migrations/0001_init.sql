-- ===========================================================================
-- Whoop Recovery Journal — initial schema
-- Tables: profiles, whoop_connections, whoop_cycles, journal_entries,
--         predictions, recommendations_log, weather_daily
-- All user data is protected by row-level security (owner-only access).
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --- updated_at helper ------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --- profiles ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  timezone text,
  location_lat double precision,
  location_lng double precision,
  location_name text,
  baseline_recovery numeric,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --- whoop_connections (holds OAuth tokens — server managed) ----------------
create table if not exists public.whoop_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  whoop_user_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text,
  connected_at timestamptz,
  last_synced_at timestamptz
);

-- --- whoop_cycles -----------------------------------------------------------
create table if not exists public.whoop_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  recovery_score numeric,
  hrv_ms numeric,
  rhr_bpm numeric,
  skin_temp_c numeric,
  spo2 numeric,
  resting_calories numeric,
  day_strain numeric,
  sleep_performance numeric,
  sleep_duration_min numeric,
  sleep_efficiency numeric,
  sleep_consistency numeric,
  respiratory_rate numeric,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create trigger whoop_cycles_set_updated_at
  before update on public.whoop_cycles
  for each row execute function public.set_updated_at();

create index if not exists whoop_cycles_user_date_idx
  on public.whoop_cycles (user_id, date);

-- --- journal_entries --------------------------------------------------------
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  alcohol_drinks integer not null default 0,
  last_meal_time text,
  fasting_hours numeric,
  creatine boolean not null default false,
  supplements text[] not null default '{}',
  energy integer not null default 3,
  mood integer not null default 3,
  training_type text not null default 'rest',
  training_intensity integer not null default 3,
  training_notes text not null default '',
  work_stress integer not null default 3,
  winddown_time text,
  water_liters numeric,
  caffeine_after_2pm boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

create index if not exists journal_entries_user_date_idx
  on public.journal_entries (user_id, date);

-- --- predictions ------------------------------------------------------------
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  predicted_score numeric not null,
  confidence numeric not null,
  actual_score numeric,
  baseline numeric not null,
  factors jsonb not null default '[]',
  model_version text not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists predictions_user_date_idx
  on public.predictions (user_id, date);

-- --- recommendations_log ----------------------------------------------------
create table if not exists public.recommendations_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  action_key text not null,
  title text not null,
  impact_points numeric not null default 0,
  followed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, date, action_key)
);

create index if not exists recommendations_log_user_date_idx
  on public.recommendations_log (user_id, date);

-- --- weather_daily ----------------------------------------------------------
create table if not exists public.weather_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  temp_min_c numeric,
  temp_max_c numeric,
  overnight_low_c numeric,
  precipitation_mm numeric,
  wind_kph numeric,
  description text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles enable row level security;
alter table public.whoop_connections enable row level security;
alter table public.whoop_cycles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.predictions enable row level security;
alter table public.recommendations_log enable row level security;
alter table public.weather_daily enable row level security;

-- profiles: id == auth.uid()
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Generic owner policies for user_id-scoped tables.
create policy "whoop_connections_rw" on public.whoop_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "whoop_cycles_rw" on public.whoop_cycles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "journal_entries_rw" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "predictions_rw" on public.predictions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "recommendations_log_rw" on public.recommendations_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weather_daily_rw" on public.weather_daily
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
