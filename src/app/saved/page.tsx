"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MealCard } from "@/components/meals/MealCard";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { Meal } from "@/types";
import { createClient } from "@/lib/supabase/client";

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
  created_at: string;
}

export default function SavedPage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMealForDetail, setSelectedMealForDetail] =
    useState<Meal | null>(null);

  useEffect(() => {
    async function loadSavedMeals() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_meals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else if (data) {
        // Transform database rows to Meal type
        const transformedMeals: Meal[] = (data as SavedMealRow[]).map((row) => ({
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

      setLoading(false);
    }

    loadSavedMeals();
  }, []);

  async function deleteMeal(mealId: string) {
    if (!confirm("Are you sure you want to delete this saved meal?")) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("saved_meals")
      .delete()
      .eq("id", mealId);

    if (error) {
      alert("Failed to delete meal");
    } else {
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
    }
  }

  return (
    <div className="min-h-screen bg-peat-50">
      <Header userEmail={userEmail} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-peat-900 mb-2">
            Saved Meals
          </h1>
          <p className="text-peat-600">
            Your collection of favourite meals to make again
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 w-3/4 rounded bg-peat-200 mb-2" />
                <div className="h-4 w-full rounded bg-peat-200 mb-1" />
                <div className="h-4 w-2/3 rounded bg-peat-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card bg-red-50 border-red-200 text-red-700">
            {error}
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
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-peat-900 mb-2">
              No saved meals yet
            </h2>
            <p className="text-peat-600 max-w-md mx-auto">
              When you generate meals, click the bookmark icon to save your
              favourites here for easy access later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal, index) => (
              <div
                key={meal.id}
                className={`opacity-0 animate-slide-up stagger-${Math.min(index + 1, 10)}`}
                style={{ animationFillMode: "forwards" }}
              >
                <div className="relative group">
                  <MealCard
                    meal={meal}
                    showCheckbox={false}
                    onViewDetails={setSelectedMealForDetail}
                  />
                  <button
                    onClick={() => deleteMeal(meal.id!)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-peat-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete meal"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedMealForDetail && (
        <MealDetailModal
          meal={selectedMealForDetail}
          isOpen={true}
          onClose={() => setSelectedMealForDetail(null)}
        />
      )}
    </div>
  );
}
