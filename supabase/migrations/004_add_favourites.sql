-- Add is_favourite column to saved_meals table
ALTER TABLE saved_meals
ADD COLUMN is_favourite BOOLEAN NOT NULL DEFAULT false;

-- Add index for faster querying of favourites
CREATE INDEX idx_saved_meals_favourite ON saved_meals(user_id, is_favourite) WHERE is_favourite = true;

COMMENT ON COLUMN saved_meals.is_favourite IS 'Whether the user has marked this meal as a favourite';
