"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { MealCard } from "@/components/meals/MealCard";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { Toast } from "@/components/Toast";
import { Meal, MealType, BudgetLevel, ComplexityLevel, Season } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { addMealToShoppingList, toggleFavourite } from "@/app/actions/meals";
import { transformSavedMealToMeal } from "@/lib/meal-utils";

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
  const [selectedComplexityLevels, setSelectedComplexityLevels] = useState<ComplexityLevel[]>([]);

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

      // Complexity level filter
      if (selectedComplexityLevels.length > 0) {
        if (!selectedComplexityLevels.includes(meal.complexity)) {
          return false;
        }
      }

      return true;
    });
  }, [allMeals, searchQuery, selectedSeasons, selectedMealTypes, selectedPriceLevels, selectedComplexityLevels]);

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
  }, [searchQuery, selectedSeasons, selectedMealTypes, selectedPriceLevels, selectedComplexityLevels]);

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
      setToastMessage("Failed to delete meal");
      setShowToast(true);
    } else {
      setAllMeals((prev) => prev.filter((m) => m.id !== mealId));
      setToastMessage("Meal deleted successfully");
      setShowToast(true);
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
        setToastMessage("This meal is already in your messages");
      } else {
        setToastMessage("Failed to add meal to your messages");
      }
      setShowToast(true);
    } else {
      setToastMessage("Added to your messages");
      setShowToast(true);
      // Navigate after a short delay so the user sees the toast
      setTimeout(() => {
        router.push("/messages");
      }, 800);
    }
  }

  async function handleToggleFavourite(mealId: string) {
    const result = await toggleFavourite(mealId);
    if (result.error) {
      setToastMessage("Failed to update favourite status");
      setShowToast(true);
    } else {
      // Update the meal in the list with the new favourite status
      setAllMeals((prev) =>
        prev.map((m) =>
          m.id === mealId ? { ...m, isFavourite: result.isFavourite } : m
        )
      );
      setToastMessage(result.isFavourite ? "Added to favourites" : "Removed from favourites");
      setShowToast(true);
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

  function toggleComplexityLevel(complexityLevel: ComplexityLevel) {
    setSelectedComplexityLevels((prev) =>
      prev.includes(complexityLevel)
        ? prev.filter((c) => c !== complexityLevel)
        : [...prev, complexityLevel]
    );
  }

  function clearAllFilters() {
    setSearchQuery("");
    setSelectedSeasons([]);
    setSelectedMealTypes([]);
    setSelectedPriceLevels([]);
    setSelectedComplexityLevels([]);
  }

  const hasActiveFilters =
    searchQuery ||
    selectedSeasons.length > 0 ||
    selectedMealTypes.length > 0 ||
    selectedPriceLevels.length > 0 ||
    selectedComplexityLevels.length > 0;

  return (
    <div className="min-h-screen bg-peat-50 dark:bg-peat-950">
      <Header userEmail={userEmail} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-peat-900 dark:text-peat-50 mb-2">
            Saved Recipes
          </h1>
          <p className="text-peat-600 dark:text-peat-400">
            Your complete recipe collection
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 w-3/4 rounded bg-peat-200 dark:bg-peat-700 mb-2" />
                <div className="h-4 w-full rounded bg-peat-200 dark:bg-peat-700 mb-1" />
                <div className="h-4 w-2/3 rounded bg-peat-200 dark:bg-peat-700" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : allMeals.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brine-100 to-oat-100 dark:from-brine-900/30 dark:to-oat-900/30 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-brine-600 dark:text-brine-400"
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
            <h2 className="font-display text-2xl text-peat-900 dark:text-peat-50 mb-2">
              No saved meals yet
            </h2>
            <p className="text-peat-600 dark:text-peat-400 max-w-md mx-auto">
              When you generate meals, they&apos;re automatically saved here for easy access later.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[300px,1fr] gap-8">
            {/* Filters sidebar */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-peat-900 dark:text-peat-100">Filter & Search</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-brine-600 dark:text-brine-400 hover:text-brine-700 dark:hover:text-brine-300 underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-peat-700 dark:text-peat-300 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meals..."
                    className="w-full px-3 py-2 rounded-lg border border-peat-200 dark:border-peat-700 dark:bg-peat-800 dark:text-peat-100 focus:border-brine-500 focus:ring-2 focus:ring-brine-100 dark:focus:ring-brine-900/50 outline-none text-sm"
                  />
                </div>

                {/* Season filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-peat-700 dark:text-peat-300 mb-2">
                    Season
                  </label>
                  <div className="space-y-2">
                    {(["spring", "summer", "autumn", "winter"] as Season[]).map((season) => (
                      <label key={season} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSeasons.includes(season)}
                          onChange={() => toggleSeason(season)}
                          className="w-4 h-4 rounded border-peat-300 text-brine-600 focus:ring-brine-500"
                        />
                        <span className="text-sm text-peat-700 dark:text-peat-300 capitalize">{season}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Meal type filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-peat-700 dark:text-peat-300 mb-2">
                    Meal Type
                  </label>
                  <div className="space-y-2">
                    {(["breakfast", "lunch", "dinner"] as MealType[]).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMealTypes.includes(type)}
                          onChange={() => toggleMealType(type)}
                          className="w-4 h-4 rounded border-peat-300 text-brine-600 focus:ring-brine-500"
                        />
                        <span className="text-sm text-peat-700 dark:text-peat-300 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price level filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-peat-700 dark:text-peat-300 mb-2">
                    Budget
                  </label>
                  <div className="space-y-2">
                    {([1, 2, 3] as BudgetLevel[]).map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPriceLevels.includes(level)}
                          onChange={() => togglePriceLevel(level)}
                          className="w-4 h-4 rounded border-peat-300 text-brine-600 focus:ring-brine-500"
                        />
                        <span className="text-sm text-peat-700 dark:text-peat-300">
                          {level === 1 ? "£ - Budget" : level === 2 ? "££ - Mid-range" : "£££ - Premium"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Complexity level filter */}
                <div>
                  <label className="block text-sm font-medium text-peat-700 dark:text-peat-300 mb-2">
                    Complexity
                  </label>
                  <div className="space-y-2">
                    {(["simple", "moderate", "complex"] as ComplexityLevel[]).map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedComplexityLevels.includes(level)}
                          onChange={() => toggleComplexityLevel(level)}
                          className="w-4 h-4 rounded border-peat-300 text-brine-600 focus:ring-brine-500"
                        />
                        <span className="text-sm text-peat-700 dark:text-peat-300">
                          {level.charAt(0).toUpperCase() + level.slice(1)}
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
              <div className="mb-4 text-sm text-peat-600 dark:text-peat-400">
                {filteredMeals.length === allMeals.length ? (
                  <span>{allMeals.length} saved meal{allMeals.length !== 1 ? 's' : ''}</span>
                ) : (
                  <span>
                    Showing {filteredMeals.length} of {allMeals.length} meal{allMeals.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {filteredMeals.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-peat-100 dark:bg-peat-800 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-peat-400 dark:text-peat-500"
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
                  <h3 className="text-lg font-medium text-peat-900 dark:text-peat-100 mb-1">
                    No meals found
                  </h3>
                  <p className="text-peat-600 dark:text-peat-400">
                    Try adjusting your filters or search query
                  </p>
                </div>
              ) : (
                <>
                  {/* Meal list */}
                  <div className="space-y-4 mb-6">
                    {paginatedMeals.map((meal, index) => (
                      <div
                        key={meal.id}
                        className={`opacity-0 animate-slide-up stagger-${Math.min(index + 1, 10)}`}
                        style={{ animationFillMode: "forwards" }}
                      >
                        <MealCard
                          meal={meal}
                          showCheckbox={false}
                          showShareButton={true}
                          showFavouriteButton={true}
                          showDeleteButton={true}
                          onViewDetails={setSelectedMealForDetail}
                          onShareSuccess={handleShareSuccess}
                          onToggleFavourite={handleToggleFavourite}
                          onDelete={deleteMeal}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-peat-200 dark:border-peat-700 text-peat-700 dark:text-peat-300 hover:bg-peat-50 dark:hover:bg-peat-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
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
                              <span key={page} className="px-2 text-peat-400 dark:text-peat-500">
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
                              className={`w-10 h-10 rounded-lg transition-colors ${
                                currentPage === page
                                  ? "bg-brine-600 text-white"
                                  : "border border-peat-200 dark:border-peat-700 text-peat-700 dark:text-peat-300 hover:bg-peat-50 dark:hover:bg-peat-800"
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
                        className="px-4 py-2 rounded-lg border border-peat-200 dark:border-peat-700 text-peat-700 dark:text-peat-300 hover:bg-peat-50 dark:hover:bg-peat-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          showFavouriteButton={true}
          onShareSuccess={handleShareSuccess}
          onToggleFavourite={handleToggleFavourite}
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
