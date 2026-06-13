-- ===========================================================================
-- Whoop Recovery Journal — feature expansion
-- Adds: protocol experiments, fasting tracker, bloodwork panels.
-- ===========================================================================

-- --- experiments (n-of-1 self-tests) ---------------------------------------
create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  hypothesis text not null default '',
  condition_key text not null,
  start_date date not null,
  end_date date,
  target_days integer not null default 14,
  status text not null default 'active',
  result_summary text,
  created_at timestamptz not null default now()
);

create index if not exists experiments_user_idx
  on public.experiments (user_id, status);

-- --- fasts (fasting sessions) ----------------------------------------------
create table if not exists public.fasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz,
  target_hours numeric not null default 16,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists fasts_user_idx on public.fasts (user_id, start_at);
-- At most one active (open) fast per user.
create unique index if not exists fasts_one_active
  on public.fasts (user_id) where end_at is null;

-- --- bloodwork panels -------------------------------------------------------
create table if not exists public.bloodwork_panels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  markers jsonb not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists bloodwork_user_idx
  on public.bloodwork_panels (user_id, date);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.experiments enable row level security;
alter table public.fasts enable row level security;
alter table public.bloodwork_panels enable row level security;

create policy "experiments_rw" on public.experiments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "fasts_rw" on public.fasts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bloodwork_panels_rw" on public.bloodwork_panels
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
