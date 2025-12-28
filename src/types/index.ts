export type MealType = "breakfast" | "lunch" | "dinner";

export type BudgetLevel = 1 | 2 | 3;

export type ComplexityLevel = "simple" | "moderate" | "complex";

export type Season = "spring" | "summer" | "autumn" | "winter";

export type IngredientCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "fish"
  | "storecupboard"
  | "frozen"
  | "bakery";

export interface Ingredient {
  name: string;
  quantity: string;
  category: IngredientCategory;
}

export interface Meal {
  id?: string;
  name: string;
  description: string;
  mealType: MealType;
  priceLevel: BudgetLevel;
  complexity: ComplexityLevel;
  prepTime: number;
  servings: number;
  seasons: Season[];
  ingredients: Ingredient[];
  instructions: string[];
}

export interface GenerateMealsParams {
  season: Season;
  mealTypes: MealType[];
  budget: BudgetLevel;
  complexity: ComplexityLevel;
  householdSize: number;
  dietaryRequirements?: string[];
  excludeIngredients?: string[];
  countryCode?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export interface ShoppingListItem extends Ingredient {
  checked: boolean;
  fromMeals: string[];
}

export interface ShoppingList {
  items: ShoppingListItem[];
  mealIds: string[];
  createdAt: string;
}

export interface UserPreferences {
  id?: string;
  userId: string;
  householdSize: number;
  dietaryRequirements: string[];
  defaultBudget: BudgetLevel;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedMeal extends Meal {
  id: string;
  userId: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}
