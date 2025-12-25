"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ShoppingList } from "@/components/shopping/ShoppingList";
import { Meal } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  addMealToShoppingList,
  getShoppingList,
  clearShoppingList,
  removeMealFromShoppingList,
} from "@/app/actions/meals";

export default function ShoppingListPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMeals() {
    const supabase = createClient();

    // Load existing shopping list from database
    const result = await getShoppingList();
    if (result.data) {
      const mealIds = result.data.meal_ids as string[];

      if (mealIds.length > 0) {
        // Fetch meal data for each ID
        const { data: mealsData } = await supabase
          .from("saved_meals")
          .select("*")
          .in("id", mealIds);

        if (mealsData) {
          // Transform database rows to Meal type
          const transformedMeals: Meal[] = mealsData.map((row) => ({
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
          }));
          setMeals(transformedMeals);
        }
      }
    }
  }

  useEffect(() => {
    async function init() {
      // Get user
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      // Check if there are new meals from sessionStorage (just navigated from plan/saved page)
      const storedMeals = sessionStorage.getItem("selectedMeals");
      if (storedMeals) {
        try {
          const parsedMeals = JSON.parse(storedMeals);

          // Add each meal to the shopping list
          for (const meal of parsedMeals) {
            await addMealToShoppingList(meal);
          }

          // Clear sessionStorage
          sessionStorage.removeItem("selectedMeals");

          // Reload meals from database
          await loadMeals();
        } catch (error) {
          console.error("Error saving shopping list:", error);
        }
      } else {
        // Load existing shopping list
        await loadMeals();
      }

      setLoading(false);
    }
    init();
  }, []);

  async function handleClearList() {
    if (!confirm("Are you sure you want to clear your entire shopping list?")) {
      return;
    }

    const result = await clearShoppingList();
    if (result.error) {
      alert("Failed to clear shopping list");
    } else {
      setMeals([]);
    }
  }

  async function handleRemoveMeal(mealId: string) {
    const result = await removeMealFromShoppingList(mealId);
    if (result.error) {
      alert("Failed to remove meal from shopping list");
    } else {
      // Reload meals
      await loadMeals();
    }
  }

  return (
    <div className="min-h-screen bg-peat-50">
      <Header userEmail={userEmail} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-peat-900 mb-2">
            Shopping List
          </h1>
          <p className="text-peat-600">
            Your aggregated ingredients, ready for the shop
          </p>
        </div>

        {loading ? (
          <div className="card">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-peat-200 rounded" />
              <div className="h-4 w-2/3 bg-peat-200 rounded" />
              <div className="h-4 w-1/2 bg-peat-200 rounded" />
            </div>
          </div>
        ) : meals.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brine-100 to-oat-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-brine-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-peat-900 mb-2">
              No meals selected
            </h2>
            <p className="text-peat-600 max-w-md mx-auto mb-6">
              Head to the Plan page to generate meals and select the ones you
              want to cook this week.
            </p>
            <button
              onClick={() => router.push("/plan")}
              className="btn-primary"
            >
              Plan Meals
            </button>
          </div>
        ) : (
          <div className="card">
            <ShoppingList
              meals={meals}
              onClear={handleClearList}
              onRemoveMeal={handleRemoveMeal}
            />
          </div>
        )}
      </main>
    </div>
  );
}
