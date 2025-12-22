-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text unique,
  role text not null default 'member' check (role in ('member','creator','admin')),
  created_at timestamptz not null default now()
);

-- Creators
create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  display_name text not null,
  slug text not null unique,
  bio text,
  monthly_price_cents integer not null default 0 check (monthly_price_cents >= 0),
  stripe_account_id text,
  stripe_onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references profiles (id) on delete cascade,
  creator_id uuid not null references creators (id) on delete cascade,
  status text not null default 'incomplete',
  price_cents integer not null default 0,
  stripe_subscription_id text,
  stripe_customer_id text,
  stripe_checkout_session_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (member_id, creator_id)
);

-- Programs
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators (id) on delete cascade,
  title text not null,
  description text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs (id) on delete cascade,
  day_number integer not null,
  title text,
  unique (program_id, day_number)
);

create table if not exists program_exercises (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references program_days (id) on delete cascade,
  name text not null,
  instructions text,
  position integer not null default 0
);

-- Workouts
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions (id) on delete cascade,
  program_day_id uuid references program_days (id) on delete set null,
  performed_at timestamptz not null default now()
);

create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts (id) on delete cascade,
  exercise_name text not null,
  weight numeric,
  reps integer,
  rpe numeric,
  notes text
);

-- Indexes
create index if not exists idx_creators_slug on creators(slug);
create index if not exists idx_subscriptions_member on subscriptions(member_id);
create index if not exists idx_subscriptions_creator on subscriptions(creator_id);
create index if not exists idx_programs_creator on programs(creator_id);
create index if not exists idx_program_days_program on program_days(program_id);
create index if not exists idx_program_exercises_day on program_exercises(program_day_id);
create index if not exists idx_workouts_subscription on workouts(subscription_id);

-- Row Level Security
alter table profiles enable row level security;
alter table creators enable row level security;
alter table subscriptions enable row level security;
alter table programs enable row level security;
alter table program_days enable row level security;
alter table program_exercises enable row level security;
alter table workouts enable row level security;
alter table workout_sets enable row level security;

-- Profiles policies
create policy "Profiles can view self or admin" on profiles
  for select using (auth.uid() = id or exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Profiles can insert self" on profiles
  for insert with check (auth.uid() = id);
create policy "Profiles can update self" on profiles
  for update using (auth.uid() = id);

-- Creators policies
create policy "Creators are public" on creators for select using (true);
create policy "User can insert own creator" on creators for insert with check (auth.uid() = user_id);
create policy "User can update own creator" on creators for update using (auth.uid() = user_id);

-- Subscriptions policies
create policy "Members read their subscriptions" on subscriptions for select using (auth.uid() = member_id);
create policy "Creators read their subscribers" on subscriptions for select using (
  exists(select 1 from creators c where c.id = subscriptions.creator_id and c.user_id = auth.uid())
);
create policy "Members create subscriptions" on subscriptions for insert with check (auth.uid() = member_id);
create policy "Members update their subscriptions" on subscriptions for update using (auth.uid() = member_id);

-- Programs policies
create policy "Creators manage programs" on programs for all using (
  exists(select 1 from creators c where c.id = programs.creator_id and c.user_id = auth.uid())
) with check (
  exists(select 1 from creators c where c.id = programs.creator_id and c.user_id = auth.uid())
);
create policy "Members view creator programs" on programs for select using (
  exists(
    select 1
    from subscriptions s
    join creators c on c.id = s.creator_id
    where s.member_id = auth.uid() and c.id = programs.creator_id
  ) or exists(select 1 from creators c where c.id = programs.creator_id)
);

-- Program days policies
create policy "Creators manage days" on program_days for all using (
  exists(
    select 1 from programs p join creators c on c.id = p.creator_id where p.id = program_days.program_id and c.user_id = auth.uid()
  )
) with check (
  exists(
    select 1 from programs p join creators c on c.id = p.creator_id where p.id = program_days.program_id and c.user_id = auth.uid()
  )
);
create policy "Members view program days" on program_days for select using (
  exists(
    select 1
    from subscriptions s
    join programs p on p.creator_id = s.creator_id
    where s.member_id = auth.uid() and p.id = program_days.program_id
  ) or exists(
    select 1 from programs p join creators c on c.id = p.creator_id where p.id = program_days.program_id
  )
);

-- Program exercises policies
create policy "Creators manage exercises" on program_exercises for all using (
  exists(
    select 1 from program_days d join programs p on p.id = d.program_id join creators c on c.id = p.creator_id where d.id = program_exercises.program_day_id and c.user_id = auth.uid()
  )
) with check (
  exists(
    select 1 from program_days d join programs p on p.id = d.program_id join creators c on c.id = p.creator_id where d.id = program_exercises.program_day_id and c.user_id = auth.uid()
  )
);
create policy "Members view exercises" on program_exercises for select using (
  exists(
    select 1
    from subscriptions s
    join program_days d on d.program_id in (
      select program_id from program_days where id = program_exercises.program_day_id
    )
    join programs p on p.id = d.program_id
    where s.member_id = auth.uid() and p.creator_id = s.creator_id
  ) or exists(
    select 1 from program_days d join programs p on p.id = d.program_id join creators c on c.id = p.creator_id where d.id = program_exercises.program_day_id
  )
);

-- Workouts policies
create policy "Members manage workouts" on workouts for all using (
  exists(select 1 from subscriptions s where s.id = workouts.subscription_id and s.member_id = auth.uid())
) with check (
  exists(select 1 from subscriptions s where s.id = workouts.subscription_id and s.member_id = auth.uid())
);

create policy "Members manage workout sets" on workout_sets for all using (
  exists(select 1 from workouts w join subscriptions s on s.id = w.subscription_id where w.id = workout_sets.workout_id and s.member_id = auth.uid())
) with check (
  exists(select 1 from workouts w join subscriptions s on s.id = w.subscription_id where w.id = workout_sets.workout_id and s.member_id = auth.uid())
);
