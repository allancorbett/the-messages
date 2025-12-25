"use client";

import { Header } from "@/components/Header";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { MealFilters } from "@/components/meals/MealFilters";
import { MealList } from "@/components/meals/MealList";
import { createClient } from "@/lib/supabase/client";
import { getCurrentSeason } from "@/lib/utils";
import { BudgetLevel, Meal, MealType, Season } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlanPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");

  // Filters
  const [season, setSeason] = useState<Season>(getCurrentSeason());
  const [mealTypes, setMealTypes] = useState<MealType[]>([
    "breakfast",
    "lunch",
    "dinner",
  ]);
  const [budget, setBudget] = useState<BudgetLevel>(2);
  const [householdSize, setHouseholdSize] = useState(2);

  // Meals state
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMealForDetail, setSelectedMealForDetail] =
    useState<Meal | null>(null);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
    getUser();
  }, []);

  async function generateMeals() {
    setLoading(true);
    setError(null);
    setMeals([]);
    setSelectedMeals([]);

    try {
      const response = await fetch("/api/generate-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season,
          mealTypes,
          budget,
          householdSize,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate meals");
      }

      const data = await response.json();
      setMeals(data.meals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function toggleMealSelection(meal: Meal) {
    setSelectedMeals((prev) => {
      const isSelected = prev.some((m) => m.id === meal.id);
      if (isSelected) {
        return prev.filter((m) => m.id !== meal.id);
      }
      return [...prev, meal];
    });
  }

  function selectAll() {
    setSelectedMeals([...meals]);
  }

  function deselectAll() {
    setSelectedMeals([]);
  }

  async function saveMeal(meal: Meal) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase.from("saved_meals").insert({
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
      });

      if (error) throw error;

      // Show brief success feedback
      alert("Meal saved!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save meal");
    }
  }

  function goToShoppingList() {
    // Store selected meals in sessionStorage for the shopping list page
    sessionStorage.setItem("selectedMeals", JSON.stringify(selectedMeals));
    router.push("/shopping-list");
  }

  return (
    <div className="min-h-screen bg-peat-50">
      <Header userEmail={userEmail} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-peat-900 mb-2">
            Plan Your Meals
          </h1>
          <p className="text-peat-600">
            Choose your preferences and we&apos;ll suggest seasonal meals for you
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px,1fr] gap-8">
          {/* Filters sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card">
              <h2 className="font-medium text-peat-900 mb-4">Preferences</h2>
              <MealFilters
                season={season}
                onSeasonChange={setSeason}
                mealTypes={mealTypes}
                onMealTypesChange={setMealTypes}
                budget={budget}
                onBudgetChange={setBudget}
                householdSize={householdSize}
                onHouseholdSizeChange={setHouseholdSize}
              />

              <button
                onClick={generateMeals}
                disabled={loading || mealTypes.length === 0}
                className="btn-primary w-full mt-6"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Generate 10 Meals
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Meals list */}
          <div>
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            {meals.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-peat-600">
                    {selectedMeals.length} of {meals.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="text-sm text-brine-600 hover:text-brine-700"
                    >
                      Select all
                    </button>
                    <span className="text-peat-300">|</span>
                    <button
                      onClick={deselectAll}
                      className="text-sm text-peat-500 hover:text-peat-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {selectedMeals.length > 0 && (
                  <button onClick={goToShoppingList} className="btn-primary">
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Get the Messages
                  </button>
                )}
              </div>
            )}

            <MealList
              meals={meals}
              selectedMeals={selectedMeals}
              onToggleSelect={toggleMealSelection}
              onSave={saveMeal}
              onViewDetails={setSelectedMealForDetail}
              loading={loading}
            />

            {!loading && meals.length === 0 && (
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-2xl text-peat-900 mb-2">
                  Ready to plan?
                </h2>
                <p className="text-peat-600 max-w-md mx-auto mb-6">
                  Set your preferences on the left and hit Generate to get 10
                  seasonal meal suggestions tailored to Scottish supermarkets.
                </p>
                <button onClick={generateMeals} className="btn-primary">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Generate Meals
                </button>
              </div>
            )}
          </div>
        </div>
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
