"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Toast } from "@/components/Toast";
import { Meal } from "@/types";
import { getMealById, toggleFavourite } from "@/app/actions/meals";
import {
  formatPrepTime,
  getBudgetSymbol,
  getMealTypeEmoji,
  capitalise,
  cn,
} from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadMeal() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
      }

      const id = params.id as string;
      const result = await getMealById(id);

      if (result.error || !result.data) {
        setError(result.error || "Meal not found");
      } else {
        setMeal(result.data);
      }

      setLoading(false);
    }

    loadMeal();
  }, [params.id]);

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setToastMessage("Recipe link copied to clipboard!");
      setShowToast(true);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  }

  function addToShoppingList() {
    if (!meal) return;
    sessionStorage.setItem("selectedMeals", JSON.stringify([meal]));
    setToastMessage("Added to your messages");
    setShowToast(true);

    // Navigate immediately
    router.push("/messages");
  }

  async function handleToggleFavourite() {
    if (!meal?.id) return;

    // Optimistically update UI immediately
    const newFavouriteStatus = !meal.isFavourite;
    setMeal((prev) => prev ? { ...prev, isFavourite: newFavouriteStatus } : null);
    setToastMessage(newFavouriteStatus ? "Added to favourites" : "Removed from favourites");
    setShowToast(true);

    // Call server action in background
    const result = await toggleFavourite(meal.id);

    // If it failed, revert
    if (result.error) {
      setMeal((prev) => prev ? { ...prev, isFavourite: !newFavouriteStatus } : null);
      setToastMessage("Failed to update favourite status");
      setShowToast(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-peat-50">
        <Header userEmail={userEmail} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="card animate-pulse">
            <div className="h-8 w-3/4 rounded bg-peat-200 mb-4" />
            <div className="h-4 w-full rounded bg-peat-200 mb-2" />
            <div className="h-4 w-2/3 rounded bg-peat-200" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="min-h-screen bg-peat-50">
        <Header userEmail={userEmail} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="card bg-red-50 border-red-200 text-center py-16">
            <h2 className="font-display text-2xl text-red-900 mb-2">
              Recipe Not Found
            </h2>
            <p className="text-red-700 mb-6">
              {error || "This recipe could not be found."}
            </p>
            <button onClick={() => router.push("/saved")} className="btn-primary">
              View Saved Recipes
            </button>
          </div>
        </main>
      </div>
    );
  }

  const ingredientsByCategory = meal.ingredients.reduce(
    (acc, ingredient) => {
      if (!acc[ingredient.category]) {
        acc[ingredient.category] = [];
      }
      acc[ingredient.category].push(ingredient);
      return acc;
    },
    {} as Record<string, typeof meal.ingredients>
  );

  const categoryOrder = [
    "produce",
    "meat",
    "fish",
    "dairy",
    "bakery",
    "storecupboard",
    "frozen",
  ];

  return (
    <div className="min-h-screen bg-peat-50">
      <Header userEmail={userEmail} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Recipe Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl" aria-hidden>
                  {getMealTypeEmoji(meal.mealType)}
                </span>
                <span
                  className={`badge ${
                    meal.priceLevel === 1
                      ? "badge-economic"
                      : meal.priceLevel === 2
                        ? "badge-mid"
                        : "badge-fancy"
                  }`}
                >
                  {getBudgetSymbol(meal.priceLevel)}
                </span>
                <span className="text-sm text-peat-500">
                  {capitalise(meal.mealType)}
                </span>
              </div>
              <h1 className="font-display text-3xl text-peat-900 mb-3">
                {meal.name}
              </h1>
              <p className="text-peat-700 mb-4">{meal.description}</p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-peat-600">
                <span className="flex items-center gap-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatPrepTime(meal.prepTime)}
                </span>
                <span className="flex items-center gap-2">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Serves {meal.servings}
                </span>
                <span className="flex items-center gap-2">
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
                  {meal.ingredients.length} ingredients
                </span>
                <span className="flex items-center gap-2">
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
                  {capitalise(meal.complexity)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={addToShoppingList} className="btn-primary flex-1 min-w-[200px]">
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add to Messages
            </button>
            <button
              onClick={handleToggleFavourite}
              className={cn(
                "btn-secondary flex-1 min-w-[140px]",
                meal?.isFavourite && "!bg-red-50 !text-red-600 !border-red-200"
              )}
              title={meal?.isFavourite ? "Remove from favourites" : "Add to favourites"}
            >
              <svg
                className="w-5 h-5"
                fill={meal?.isFavourite ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {meal?.isFavourite ? "Unfavourite" : "Favourite"}
            </button>
            <button
              onClick={handleShare}
              className="btn-secondary flex-1 min-w-[160px]"
              title="Copy recipe URL to clipboard"
            >
              {copySuccess ? (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share Recipe
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ingredients */}
        <div className="card mb-6">
          <h2 className="font-display text-2xl text-peat-900 mb-4">
            Ingredients
          </h2>
          <div className="space-y-4">
            {categoryOrder.map((category) => {
              const items = ingredientsByCategory[category];
              if (!items || items.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-sm font-medium text-peat-500 uppercase tracking-wide mb-2">
                    {capitalise(category)}
                  </h3>
                  <ul className="space-y-2">
                    {items.map((ingredient, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-peat-700"
                      >
                        <span className="text-brine-500 mt-1.5">•</span>
                        <span>
                          <span className="font-medium">
                            {ingredient.quantity}
                          </span>{" "}
                          {ingredient.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <h2 className="font-display text-2xl text-peat-900 mb-4">
            Instructions
          </h2>
          <ol className="space-y-4">
            {meal.instructions.map((instruction, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brine-100 text-brine-700 font-medium flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-peat-700 pt-1">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>
      </main>

      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
}
