-- The Messages - Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql)

-- User preferences table
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  household_size int default 2,
  dietary_requirements text[] default '{}',
  default_budget int default 2 check (default_budget between 1 and 3),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Saved meals table
create table if not exists saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  price_level int not null check (price_level between 1 and 3),
  prep_time int,
  servings int default 2,
  season text[] default '{}',
  ingredients jsonb not null default '[]',
  instructions text[] default '{}',
  created_at timestamptz default now()
);

-- Shopping lists table (optional, for history)
create table if not exists shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  meal_ids uuid[] default '{}',
  items jsonb not null default '[]',
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_user_preferences_user_id on user_preferences(user_id);
create index if not exists idx_saved_meals_user_id on saved_meals(user_id);
create index if not exists idx_saved_meals_created_at on saved_meals(created_at desc);
create index if not exists idx_shopping_lists_user_id on shopping_lists(user_id);

-- Enable Row Level Security
alter table user_preferences enable row level security;
alter table saved_meals enable row level security;
alter table shopping_lists enable row level security;

-- RLS Policies for user_preferences
create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can delete own preferences"
  on user_preferences for delete
  using (auth.uid() = user_id);

-- RLS Policies for saved_meals
create policy "Users can view own saved meals"
  on saved_meals for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved meals"
  on saved_meals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own saved meals"
  on saved_meals for update
  using (auth.uid() = user_id);

create policy "Users can delete own saved meals"
  on saved_meals for delete
  using (auth.uid() = user_id);

-- RLS Policies for shopping_lists
create policy "Users can view own shopping lists"
  on shopping_lists for select
  using (auth.uid() = user_id);

create policy "Users can insert own shopping lists"
  on shopping_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own shopping lists"
  on shopping_lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own shopping lists"
  on shopping_lists for delete
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for user_preferences updated_at
create trigger update_user_preferences_updated_at
  before update on user_preferences
  for each row
  execute function update_updated_at_column();
