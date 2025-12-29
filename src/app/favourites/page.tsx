"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { MealCard } from "@/components/meals/MealCard";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { Toast } from "@/components/Toast";
import { Meal } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { addMealToShoppingList, toggleFavourite } from "@/app/actions/meals";
import { transformSavedMealToMeal } from "@/lib/meal-utils";

export default function FavouritesPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [favouriteMeals, setFavouriteMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealForDetail, setSelectedMealForDetail] =
    useState<Meal | null>(null);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  async function loadFavouriteMeals() {
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
      .eq("is_favourite", true)
      .order("created_at", { ascending: false });

    if (error) {
      setToastMessage("Failed to load favourite meals");
      setShowToast(true);
    } else if (data) {
      const transformedMeals: Meal[] = data.map(transformSavedMealToMeal);
      setFavouriteMeals(transformedMeals);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadFavouriteMeals();
  }, []);

  function handleShareSuccess() {
    setToastMessage("Recipe link copied to clipboard!");
    setShowToast(true);
  }

  async function handleToggleFavourite(mealId: string) {
    const result = await toggleFavourite(mealId);
    if (result.error) {
      setToastMessage("Failed to update favourite status");
      setShowToast(true);
    } else {
      // Reload the list since unfavouriting will remove it from this view
      await loadFavouriteMeals();
      setToastMessage(result.isFavourite ? "Added to favourites" : "Removed from favourites");
      setShowToast(true);
    }
  }

  async function addToShoppingList(meal: Meal) {
    const result = await addMealToShoppingList(meal);
    if (result.error) {
      if (result.error === "Meal already in shopping list") {
        setToastMessage("This meal is already in your shopping list");
      } else {
        setToastMessage("Failed to add meal to shopping list");
      }
      setShowToast(true);
    } else {
      setToastMessage("Added to shopping list");
      setShowToast(true);
      setTimeout(() => {
        router.push("/shopping-list");
      }, 800);
    }
  }

  return (
    <div className="min-h-screen bg-peat-50">
      <Header userEmail={userEmail} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-peat-900 mb-2">
            Favourite Meals
          </h1>
          <p className="text-peat-600">
            Your collection of favourite recipes
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-32 bg-peat-200 rounded" />
              </div>
            ))}
          </div>
        ) : favouriteMeals.length === 0 ? (
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
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-peat-900 mb-2">
              No favourite meals yet
            </h2>
            <p className="text-peat-600 max-w-md mx-auto mb-6">
              Browse your saved meals and mark your favourites by clicking the heart icon
            </p>
            <button
              onClick={() => router.push("/saved")}
              className="btn-primary"
            >
              Browse Saved Meals
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favouriteMeals.map((meal, index) => (
              <div
                key={meal.id}
                className={`opacity-0 animate-slide-up stagger-${Math.min(index + 1, 10)}`}
                style={{ animationFillMode: "forwards" }}
              >
                <MealCard
                  meal={meal}
                  onViewDetails={setSelectedMealForDetail}
                  showCheckbox={false}
                  showFavouriteButton={true}
                  showShareButton={true}
                  onToggleFavourite={handleToggleFavourite}
                  onShareSuccess={handleShareSuccess}
                />
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
