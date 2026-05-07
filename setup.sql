-- ============================================================
-- The Gym Success Plan — Supabase schema
-- Run this in the Supabase SQL Editor (or `supabase db push`).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------------- USERS ----------------
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  goal text check (goal in ('cut','maintain','bulk')),
  weight numeric,
  height numeric,
  experience text,
  bmr numeric,
  calorie_target numeric,
  subscription_status text check (subscription_status in ('active','expired','none')) default 'none',
  subscription_expires timestamptz,
  stripe_customer_id text,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_workout_date date,
  pwa_installed boolean default false,
  onboarded boolean default false,
  created_at timestamptz default now()
);

-- ---------------- WORKOUTS ----------------
create table if not exists public.workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  day_number integer check (day_number between 1 and 4),
  day_name text,
  completed_at timestamptz default now(),
  duration_minutes integer,
  notes text
);
create index if not exists idx_workouts_user on public.workouts(user_id, completed_at desc);

-- ---------------- SETS ----------------
create table if not exists public.sets (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid references public.workouts(id) on delete cascade,
  exercise_name text not null,
  set_number integer,
  weight numeric,
  reps integer,
  is_drop_set boolean default false,
  is_pr boolean default false,
  completed_at timestamptz default now()
);
create index if not exists idx_sets_workout on public.sets(workout_id);
create index if not exists idx_sets_exercise on public.sets(exercise_name);

-- ---------------- PERSONAL RECORDS ----------------
create table if not exists public.personal_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  exercise_name text not null,
  weight numeric not null,
  reps integer not null,
  achieved_at timestamptz default now()
);
create index if not exists idx_pr_user on public.personal_records(user_id, achieved_at desc);

-- ---------------- BODY WEIGHT LOG ----------------
create table if not exists public.body_weight_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  weight numeric not null,
  logged_at timestamptz default now()
);
create index if not exists idx_bw_user on public.body_weight_log(user_id, logged_at desc);

-- ---------------- NUTRITION LOG ----------------
create table if not exists public.nutrition_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  food_name text not null,
  calories integer default 0,
  protein numeric default 0,
  carbs numeric default 0,
  fats numeric default 0,
  logged_at timestamptz default now()
);
create index if not exists idx_nutrition_user on public.nutrition_log(user_id, logged_at desc);

-- ---------------- COMMUNITY POSTS ----------------
create table if not exists public.community_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  user_name text,
  content text not null,
  likes integer default 0,
  created_at timestamptz default now()
);
create index if not exists idx_posts_created on public.community_posts(created_at desc);

-- ---------------- COMMUNITY COMMENTS ----------------
create table if not exists public.community_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.community_posts(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  user_name text,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists idx_comments_post on public.community_comments(post_id, created_at);

-- ---------------- PROGRESS PHOTOS ----------------
create table if not exists public.progress_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  photo_url text not null,
  notes text,
  taken_at timestamptz default now()
);
create index if not exists idx_photos_user on public.progress_photos(user_id, taken_at desc);

-- ============================================================
-- Row level security policies
-- ============================================================
alter table public.users               enable row level security;
alter table public.workouts            enable row level security;
alter table public.sets                enable row level security;
alter table public.personal_records    enable row level security;
alter table public.body_weight_log     enable row level security;
alter table public.nutrition_log       enable row level security;
alter table public.community_posts     enable row level security;
alter table public.community_comments  enable row level security;
alter table public.progress_photos     enable row level security;

-- Each user can manage their own row in users
create policy "users self read"  on public.users for select using (auth.uid() = id);
create policy "users self write" on public.users for all    using (auth.uid() = id);

-- Per-user owned rows
create policy "workouts owner" on public.workouts for all using (auth.uid() = user_id);
create policy "sets via workout" on public.sets for all using (
  exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
);
create policy "pr owner"   on public.personal_records for all using (auth.uid() = user_id);
create policy "bw owner"   on public.body_weight_log  for all using (auth.uid() = user_id);
create policy "nut owner"  on public.nutrition_log    for all using (auth.uid() = user_id);
create policy "photo owner" on public.progress_photos for all using (auth.uid() = user_id);

-- Community: anyone authenticated can read; only owner can write/edit own.
create policy "posts read"   on public.community_posts for select using (true);
create policy "posts write"  on public.community_posts for insert with check (auth.uid() = user_id);
create policy "posts update" on public.community_posts for update using (auth.uid() = user_id);
create policy "comments read"  on public.community_comments for select using (true);
create policy "comments write" on public.community_comments for insert with check (auth.uid() = user_id);
