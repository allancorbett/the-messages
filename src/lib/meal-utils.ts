// Utility functions for meal data transformations

import { Meal } from "@/types";

interface SavedMealRow {
  id: string;
  name: string;
  description: string;
  meal_type: string;
  price_level: number;
  prep_time: number;
  servings: number;
  season: string[];
  ingredients: Meal["ingredients"];
  instructions: string[];
  created_at?: string;
}

/**
 * Transform database row to Meal type
 * Used to avoid duplicating this logic across multiple files
 */
export function transformSavedMealToMeal(row: SavedMealRow): Meal {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    mealType: row.meal_type as Meal["mealType"],
    priceLevel: row.price_level as Meal["priceLevel"],
    prepTime: row.prep_time,
    servings: row.servings,
    seasons: row.season as Meal["seasons"],
    ingredients: row.ingredients,
    instructions: row.instructions,
  };
}
