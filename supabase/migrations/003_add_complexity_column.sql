-- Add complexity column to saved_meals table
ALTER TABLE saved_meals
ADD COLUMN complexity TEXT NOT NULL DEFAULT 'moderate'
CHECK (complexity IN ('simple', 'moderate', 'complex'));

-- Add comment to document the column
COMMENT ON COLUMN saved_meals.complexity IS 'Recipe complexity level: simple (fewer ingredients, may use pre-made items), moderate (home cook level), complex (restaurant-level techniques for home kitchen)';
