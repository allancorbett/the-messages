import { z } from "zod";

export const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner"]);

export const budgetLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const seasonSchema = z.enum(["spring", "summer", "autumn", "winter"]);

export const ingredientCategorySchema = z.enum([
  "produce",
  "dairy",
  "meat",
  "fish",
  "storecupboard",
  "frozen",
  "bakery",
]);

export const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  category: ingredientCategorySchema,
});

export const mealSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  mealType: mealTypeSchema,
  priceLevel: budgetLevelSchema,
  prepTime: z.number().positive(),
  servings: z.number().positive(),
  seasons: z.array(seasonSchema),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(z.string().min(1)),
});

export const generateMealsResponseSchema = z.object({
  meals: z.array(mealSchema),
});

export const generateMealsParamsSchema = z.object({
  season: seasonSchema,
  mealTypes: z.array(mealTypeSchema).min(1),
  budget: budgetLevelSchema,
  householdSize: z.number().int().min(1).max(12),
  dietaryRequirements: z.array(z.string()).optional(),
  excludeIngredients: z.array(z.string()).optional(),
  countryCode: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
