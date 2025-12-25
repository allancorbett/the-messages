"use server";

import { createClient } from "@/lib/supabase/server";
import { Meal } from "@/types";
import { revalidatePath } from "next/cache";

export async function saveShoppingList(meals: Meal[]) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  // First, delete any existing shopping list for this user
  await supabase.from("shopping_lists").delete().eq("user_id", user.id);

  // Aggregate items from all meals
  const items = meals.flatMap((meal) =>
    meal.ingredients.map((ingredient) => ({
      ...ingredient,
      checked: false,
      fromMeals: [meal.name],
    }))
  );

  // Save new shopping list
  const { error } = await supabase.from("shopping_lists").insert({
    user_id: user.id,
    meal_ids: meals.map((m) => m.id).filter(Boolean),
    items,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function getShoppingList() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized", data: null };
  }

  const { data, error } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // No shopping list found is not an error
    if (error.code === "PGRST116") {
      return { data: null };
    }
    return { error: error.message, data: null };
  }

  return { data };
}

export async function updateShoppingListItem(
  itemIndex: number,
  checked: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  // Get current shopping list
  const { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!shoppingList) {
    return { error: "Shopping list not found" };
  }

  // Update the item
  const items = [...(shoppingList.items as Array<{
    name: string;
    quantity: string;
    category: string;
    checked: boolean;
    fromMeals: string[];
  }>)];
  if (items[itemIndex]) {
    items[itemIndex].checked = checked;
  }

  // Save back
  const { error } = await supabase
    .from("shopping_lists")
    .update({ items })
    .eq("id", shoppingList.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function clearShoppingList() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("shopping_lists")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function saveGeneratedMeals(meals: Meal[]) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  // Save all meals to saved_meals table
  const mealsToInsert = meals.map((meal) => ({
    user_id: user.id,
    name: meal.name,
    description: meal.description,
    meal_type: meal.mealType,
    price_level: meal.priceLevel,
    prep_time: meal.prepTime,
    servings: meal.servings,
    season: meal.seasons,
    ingredients: meal.ingredients,
    instructions: meal.instructions,
  }));

  const { data, error } = await supabase
    .from("saved_meals")
    .insert(mealsToInsert)
    .select();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/saved");
  return { success: true, meals: data };
}
