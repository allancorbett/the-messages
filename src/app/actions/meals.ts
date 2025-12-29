"use server";

import { createClient } from "@/lib/supabase/server";
import { Meal } from "@/types";
import { revalidatePath } from "next/cache";
import { transformSavedMealToMeal } from "@/lib/meal-utils";

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

  revalidatePath("/shopping");
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

  revalidatePath("/shopping");
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

  revalidatePath("/shopping");
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
    complexity: meal.complexity,
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

export async function getMealById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_meals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  if (!data) {
    return { error: "Meal not found", data: null };
  }

  return { data: transformSavedMealToMeal(data) };
}

export async function addMealToShoppingList(meal: Meal) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  if (!meal.id) {
    return { error: "Meal must have an ID" };
  }

  // Get current shopping list
  const { data: currentList } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let newMealIds: string[];
  let newItems: Array<{
    name: string;
    quantity: string;
    category: string;
    checked: boolean;
    fromMeals: string[];
  }>;

  if (currentList) {
    // Check if meal is already in the list
    const existingMealIds = currentList.meal_ids as string[];
    if (existingMealIds.includes(meal.id)) {
      return { error: "Meal already in shopping list" };
    }

    // Add meal ID to the list
    newMealIds = [...existingMealIds, meal.id];

    // Merge ingredients
    const existingItems = currentList.items as typeof newItems;
    newItems = [...existingItems];

    // Add new ingredients from the meal
    meal.ingredients.forEach((ingredient) => {
      // Find if ingredient already exists (same name and category)
      const existingIndex = newItems.findIndex(
        (item) =>
          item.name.toLowerCase() === ingredient.name.toLowerCase() &&
          item.category === ingredient.category
      );

      if (existingIndex >= 0) {
        // Update existing ingredient - add meal to fromMeals
        if (!newItems[existingIndex].fromMeals.includes(meal.name)) {
          newItems[existingIndex].fromMeals.push(meal.name);
        }
        // Note: We don't combine quantities as they might be different units
      } else {
        // Add new ingredient
        newItems.push({
          ...ingredient,
          checked: false,
          fromMeals: [meal.name],
        });
      }
    });

    // Update existing shopping list
    const { error } = await supabase
      .from("shopping_lists")
      .update({ meal_ids: newMealIds, items: newItems })
      .eq("id", currentList.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Create new shopping list
    newMealIds = [meal.id];
    newItems = meal.ingredients.map((ingredient) => ({
      ...ingredient,
      checked: false,
      fromMeals: [meal.name],
    }));

    const { error } = await supabase.from("shopping_lists").insert({
      user_id: user.id,
      meal_ids: newMealIds,
      items: newItems,
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/shopping");
  return { success: true };
}

export async function removeMealFromShoppingList(mealId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  // Get current shopping list
  const { data: currentList } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!currentList) {
    return { error: "Shopping list not found" };
  }

  const existingMealIds = currentList.meal_ids as string[];
  if (!existingMealIds.includes(mealId)) {
    return { error: "Meal not in shopping list" };
  }

  // Get the meal to find its name
  const { data: mealData } = await supabase
    .from("saved_meals")
    .select("name")
    .eq("id", mealId)
    .single();

  if (!mealData) {
    return { error: "Meal not found" };
  }

  const mealName = mealData.name;

  // Remove meal ID
  const newMealIds = existingMealIds.filter((id) => id !== mealId);

  // Update ingredients - remove meal from fromMeals and delete items that only belonged to this meal
  const existingItems = currentList.items as Array<{
    name: string;
    quantity: string;
    category: string;
    checked: boolean;
    fromMeals: string[];
  }>;

  const newItems = existingItems
    .map((item) => {
      // Remove this meal from the ingredient's fromMeals array
      const updatedFromMeals = item.fromMeals.filter((m) => m !== mealName);
      return {
        ...item,
        fromMeals: updatedFromMeals,
      };
    })
    .filter((item) => item.fromMeals.length > 0); // Only keep items that belong to other meals

  if (newMealIds.length === 0) {
    // If no meals left, delete the shopping list
    const { error } = await supabase
      .from("shopping_lists")
      .delete()
      .eq("id", currentList.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Update shopping list
    const { error } = await supabase
      .from("shopping_lists")
      .update({ meal_ids: newMealIds, items: newItems })
      .eq("id", currentList.id);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/shopping");
  return { success: true };
}

export async function toggleFavourite(
  mealId: string
): Promise<{ success?: boolean; error?: string; isFavourite?: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get current favourite status
  const { data: meal, error: fetchError } = await supabase
    .from("saved_meals")
    .select("is_favourite")
    .eq("id", mealId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !meal) {
    return { error: "Meal not found" };
  }

  const newFavouriteStatus = !meal.is_favourite;

  // Toggle favourite status
  const { error: updateError } = await supabase
    .from("saved_meals")
    .update({ is_favourite: newFavouriteStatus })
    .eq("id", mealId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/saved");
  revalidatePath("/loved");
  revalidatePath("/plan");
  return { success: true, isFavourite: newFavouriteStatus };
}
