-- Enable public read access for saved meals to allow recipe sharing
-- Users can share recipe URLs and anyone can view them

-- Drop the existing select policy
drop policy if exists "Users can view own saved meals" on saved_meals;

-- Create new policy that allows anyone to read saved meals
create policy "Anyone can view saved meals"
  on saved_meals for select
  using (true);

-- Keep other policies (insert, update, delete) restricted to owners
-- These are already in place from the initial migration
