"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { MealCard } from "@/components/meals/MealCard";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { Toast } from "@/components/Toast";
import { Meal, MealType, BudgetLevel, Season } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { addMealToShoppingList } from "@/app/actions/meals";
import { transformSavedMealToMeal } from "@/lib/meal-utils";
import styles from "./page.module.css";

const ITEMS_PER_PAGE = 10;

export default function SavedPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMealForDetail, setSelectedMealForDetail] =
    useState<Meal | null>(null);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<BudgetLevel[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

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
        const transformedMeals: Meal[] = data.map(transformSavedMealToMeal);
        setAllMeals(transformedMeals);
      }

      setLoading(false);
    }

    loadSavedMeals();
  }, []);

  // Filter meals based on search and filters
  const filteredMeals = useMemo(() => {
    return allMeals.filter((meal) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = meal.name.toLowerCase().includes(query);
        const matchesDescription = meal.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      // Season filter
      if (selectedSeasons.length > 0) {
        const hasMatchingSeason = meal.seasons.some((season) =>
          selectedSeasons.includes(season)
        );
        if (!hasMatchingSeason) {
          return false;
        }
      }

      // Meal type filter
      if (selectedMealTypes.length > 0) {
        if (!selectedMealTypes.includes(meal.mealType)) {
          return false;
        }
      }

      // Price level filter
      if (selectedPriceLevels.length > 0) {
        if (!selectedPriceLevels.includes(meal.priceLevel)) {
          return false;
        }
      }

      return true;
    });
  }, [allMeals, searchQuery, selectedSeasons, selectedMealTypes, selectedPriceLevels]);

  // Paginate filtered meals
  const paginatedMeals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMeals.slice(startIndex, endIndex);
  }, [filteredMeals, currentPage]);

  const totalPages = Math.ceil(filteredMeals.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSeasons, selectedMealTypes, selectedPriceLevels]);

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
      setAllMeals((prev) => prev.filter((m) => m.id !== mealId));
    }
  }

  function handleShareSuccess() {
    setToastMessage("Recipe link copied to clipboard!");
    setShowToast(true);
  }

  async function addToShoppingList(meal: Meal) {
    const result = await addMealToShoppingList(meal);
    if (result.error) {
      if (result.error === "Meal already in shopping list") {
        alert("This meal is already in your shopping list");
      } else {
        alert("Failed to add meal to shopping list");
      }
    } else {
      router.push("/shopping-list");
    }
  }

  function toggleSeason(season: Season) {
    setSelectedSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  }

  function toggleMealType(mealType: MealType) {
    setSelectedMealTypes((prev) =>
      prev.includes(mealType)
        ? prev.filter((t) => t !== mealType)
        : [...prev, mealType]
    );
  }

  function togglePriceLevel(priceLevel: BudgetLevel) {
    setSelectedPriceLevels((prev) =>
      prev.includes(priceLevel)
        ? prev.filter((p) => p !== priceLevel)
        : [...prev, priceLevel]
    );
  }

  function clearAllFilters() {
    setSearchQuery("");
    setSelectedSeasons([]);
    setSelectedMealTypes([]);
    setSelectedPriceLevels([]);
  }

  const hasActiveFilters =
    searchQuery ||
    selectedSeasons.length > 0 ||
    selectedMealTypes.length > 0 ||
    selectedPriceLevels.length > 0;

  return (
    <div className={styles.page}>
      <Header userEmail={userEmail} />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Saved Meals
          </h1>
          <p className={styles.subtitle}>
            Your collection of favourite meals to make again
          </p>
        </div>

        {loading ? (
          <div className={styles["loading-container"]}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.card}>
                <div className={styles["skeleton-title"]} />
                <div className={styles["skeleton-line-full"]} />
                <div className={styles["skeleton-line-partial"]} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles["error-card"]}>
            {error}
          </div>
        ) : allMeals.length === 0 ? (
          <div className={`${styles["filter-card"]} ${styles["empty-state"]}`}>
            <div className={styles["empty-icon-container"]}>
              <svg
                className={styles["empty-icon"]}
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
            <h2 className={styles["empty-title"]}>
              No saved meals yet
            </h2>
            <p className={styles["empty-text"]}>
              When you generate meals, they&apos;re automatically saved here for easy access later.
            </p>
          </div>
        ) : (
          <div className={styles["grid-layout"]}>
            {/* Filters sidebar */}
            <div className={styles.sidebar}>
              <div className={styles["filter-card"]}>
                <div className={styles["filter-header"]}>
                  <h2 className={styles["filter-title"]}>Filter & Search</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className={styles["clear-button"]}
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className={styles["filter-section"]}>
                  <label className={styles["filter-label"]}>
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meals..."
                    className={styles["search-input"]}
                  />
                </div>

                {/* Season filter */}
                <div className={styles["filter-section"]}>
                  <label className={styles["filter-label"]}>
                    Season
                  </label>
                  <div className={styles["checkbox-list"]}>
                    {(["spring", "summer", "autumn", "winter"] as Season[]).map((season) => (
                      <label key={season} className={styles["checkbox-item"]}>
                        <input
                          type="checkbox"
                          checked={selectedSeasons.includes(season)}
                          onChange={() => toggleSeason(season)}
                          className={styles.checkbox}
                        />
                        <span className={styles["checkbox-label"]}>{season}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Meal type filter */}
                <div className={styles["filter-section"]}>
                  <label className={styles["filter-label"]}>
                    Meal Type
                  </label>
                  <div className={styles["checkbox-list"]}>
                    {(["breakfast", "lunch", "dinner"] as MealType[]).map((type) => (
                      <label key={type} className={styles["checkbox-item"]}>
                        <input
                          type="checkbox"
                          checked={selectedMealTypes.includes(type)}
                          onChange={() => toggleMealType(type)}
                          className={styles.checkbox}
                        />
                        <span className={styles["checkbox-label"]}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price level filter */}
                <div>
                  <label className={styles["filter-label"]}>
                    Budget
                  </label>
                  <div className={styles["checkbox-list"]}>
                    {([1, 2, 3] as BudgetLevel[]).map((level) => (
                      <label key={level} className={styles["checkbox-item"]}>
                        <input
                          type="checkbox"
                          checked={selectedPriceLevels.includes(level)}
                          onChange={() => togglePriceLevel(level)}
                          className={styles.checkbox}
                        />
                        <span className={styles["checkbox-label"]}>
                          {level === 1 ? "£ - Budget" : level === 2 ? "££ - Mid-range" : "£££ - Premium"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              {/* Results count */}
              <div className={styles["results-count"]}>
                {filteredMeals.length === allMeals.length ? (
                  <span>{allMeals.length} saved meal{allMeals.length !== 1 ? 's' : ''}</span>
                ) : (
                  <span>
                    Showing {filteredMeals.length} of {allMeals.length} meal{allMeals.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {filteredMeals.length === 0 ? (
                <div className={`${styles["filter-card"]} ${styles["no-results"]}`}>
                  <div className={styles["no-results-icon-container"]}>
                    <svg
                      className={styles["no-results-icon"]}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className={styles["no-results-title"]}>
                    No meals found
                  </h3>
                  <p className={styles["no-results-text"]}>
                    Try adjusting your filters or search query
                  </p>
                </div>
              ) : (
                <>
                  {/* Meal list */}
                  <div className={styles["meals-list"]}>
                    {paginatedMeals.map((meal, index) => (
                      <div
                        key={meal.id}
                        className={`${styles["meal-card-wrapper"]} ${styles[`stagger-${Math.min(index + 1, 10)}`]}`}
                      >
                        <div className={styles["meal-card-group"]}>
                          <MealCard
                            meal={meal}
                            showCheckbox={false}
                            showShareButton={true}
                            onViewDetails={setSelectedMealForDetail}
                            onShareSuccess={handleShareSuccess}
                          />
                          <button
                            onClick={() => deleteMeal(meal.id!)}
                            className={styles["delete-button"]}
                            title="Delete meal"
                          >
                            <svg
                              className={styles["delete-icon"]}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={styles["pagination-button"]}
                      >
                        Previous
                      </button>

                      <div className={styles["pagination-pages"]}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1;

                          const showEllipsis =
                            (page === 2 && currentPage > 3) ||
                            (page === totalPages - 1 && currentPage < totalPages - 2);

                          if (showEllipsis) {
                            return (
                              <span key={page} className={styles["pagination-ellipsis"]}>
                                ...
                              </span>
                            );
                          }

                          if (!showPage) {
                            return null;
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`${styles["page-button"]} ${
                                currentPage === page ? styles["page-button-active"] : ""
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={styles["pagination-button"]}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedMealForDetail && (
        <MealDetailModal
          meal={selectedMealForDetail}
          isOpen={true}
          onClose={() => setSelectedMealForDetail(null)}
          onAddToShoppingList={() => addToShoppingList(selectedMealForDetail)}
          showShareButton={true}
        />
      )}

      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
}
