# Database Migration Instructions

## Recipe Sharing Feature - Migration Required

To enable public recipe sharing, you need to run the migration in `supabase/migrations/002_public_meal_sharing.sql`.

### Steps:

1. Go to the Supabase SQL Editor:
   https://supabase.com/dashboard/project/eedyiwnbbljjglewdlpt/sql

2. Copy the contents of `supabase/migrations/002_public_meal_sharing.sql`

3. Paste and execute the SQL in the editor

### What this migration does:

- Removes the restrictive RLS policy that only allowed users to view their own meals
- Adds a new public read policy that allows anyone to view saved meals via URL
- Keeps write permissions (insert, update, delete) restricted to meal owners
- Enables recipe sharing functionality - anyone with a recipe URL can view it

### Security Note:

After this migration, all saved recipes will be publicly viewable if someone has the URL. Users can only modify or delete their own recipes, but anyone can read them. This is intentional to enable recipe sharing.
