"use client";

import { Header } from "@/components/Header";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { MealFilters } from "@/components/meals/MealFilters";
import { MealList } from "@/components/meals/MealList";
import { CookingLoadingOverlay } from "@/components/CookingLoadingOverlay";
import { createClient } from "@/lib/supabase/client";
import { getCurrentSeason } from "@/lib/utils";
import { BudgetLevel, Meal, MealType, Season } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { saveGeneratedMeals } from "@/app/actions/meals";
import { getUserLocation, formatLocation, type LocationData } from "@/lib/geolocation";
import { Card, EmptyState } from "@/components/ui";
import styles from "./page.module.css";

export default function PlanPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [location, setLocation] = useState<LocationData | null>(null);

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

  useEffect(() => {
    async function detectLocation() {
      try {
        const locationData = await getUserLocation();
        setLocation(locationData);
      } catch (error) {
        console.warn("Failed to get user location:", error);
        // Fallback to null location (will use default regional config)
        setLocation(null);
      }
    }
    detectLocation();
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
          countryCode: location?.countryCode,
          city: location?.city,
          region: location?.region,
          latitude: location?.latitude,
          longitude: location?.longitude,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate meals");
      }

      const data = await response.json();
      setMeals(data.meals);

      // Auto-save all generated meals to database
      const saveResult = await saveGeneratedMeals(data.meals);
      if (saveResult.error) {
        console.error("Failed to auto-save meals:", saveResult.error);
        // Don't show error to user, just log it
      }
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


  function goToShoppingList() {
    // Store selected meals in sessionStorage for the shopping list page
    sessionStorage.setItem("selectedMeals", JSON.stringify(selectedMeals));
    router.push("/shopping-list");
  }

  return (
    <div className={styles.page}>
      <Header userEmail={userEmail} />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Plan Your Meals
          </h1>
          <p className={styles.subtitle}>
            Choose your preferences and we&apos;ll suggest seasonal meals for {formatLocation(location)}
          </p>
        </div>

        <div className={styles["grid-layout"]}>
          {/* Filters sidebar */}
          <div className={styles.sidebar}>
            <Card>
              <h2 className={styles["card-title"]}>Preferences</h2>
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
                className={styles["generate-button"]}
                aria-label="Generate 10 meal suggestions based on your preferences"
                aria-busy={loading}
              >
                {loading ? (
                  <span className={styles["selection-info"]}>
                    <svg
                      className={styles["spinner-icon"]}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className={styles["spinner-opacity-25"]}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className={styles["spinner-opacity-75"]}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>
                    <svg
                      className={styles["button-icon"]}
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
            </Card>
          </div>

          {/* Meals list */}
          <div>
            {error && (
              <div className={styles["error-banner"]}>
                {error}
              </div>
            )}

            {meals.length > 0 && (
              <>
                <div className={styles["info-banner"]}>
                  <svg
                    className={styles["info-icon"]}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>All generated meals are automatically saved to your collection</span>
                </div>
                <div className={styles["selection-header"]}>
                  <div className={styles["selection-info"]}>
                    <span className={styles["selection-count"]}>
                      {selectedMeals.length} of {meals.length} selected
                    </span>
                    <div className={styles["selection-actions"]}>
                      <button
                        onClick={selectAll}
                        className={styles["link-button"]}
                        aria-label="Select all meals for shopping list"
                      >
                        Select all
                      </button>
                      <span className={styles.separator} aria-hidden="true">|</span>
                      <button
                        onClick={deselectAll}
                        className={styles["link-button-secondary"]}
                        aria-label="Clear all meal selections"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                {selectedMeals.length > 0 && (
                  <button
                    onClick={goToShoppingList}
                    className={styles["button-primary"]}
                    aria-label={`Create shopping list with ${selectedMeals.length} selected meals`}
                  >
                    <svg
                      className={styles["button-icon"]}
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
              </>
            )}

            <MealList
              meals={meals}
              selectedMeals={selectedMeals}
              onToggleSelect={toggleMealSelection}
              onViewDetails={setSelectedMealForDetail}
              loading={loading}
            />

            {!loading && meals.length === 0 && (
              <Card>
                <EmptyState
                  icon={
                    <svg
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
                  }
                  title="Ready to plan?"
                  description="Set your preferences on the left and hit Generate to get 10 seasonal meal suggestions tailored to local supermarkets."
                  action={{
                    label: "Generate Meals",
                    onClick: generateMeals,
                  }}
                />
              </Card>
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

      <CookingLoadingOverlay isLoading={loading} />
    </div>
  );
}
