"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ShoppingList } from "@/components/shopping/ShoppingList";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { Toast } from "@/components/Toast";
import { Meal, ShoppingListItem } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  addMealToShoppingList,
  getShoppingList,
  clearShoppingList,
  removeMealFromShoppingList,
  getMealById,
  updateShoppingListItem,
} from "@/app/actions/meals";

interface MealMetadata {
  id: string;
  name: string;
}

export default function ShoppingListPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [mealMetadata, setMealMetadata] = useState<MealMetadata[]>([]);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealForDetail, setSelectedMealForDetail] =
    useState<Meal | null>(null);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadShoppingList = useCallback(async () => {
    const supabase = createClient();

    // Load existing shopping list from database
    const result = await getShoppingList();
    if (result.data) {
      const mealIds = result.data.meal_ids as string[];
      const dbItems = result.data.items as ShoppingListItem[];

      // Set items directly from database (includes checked state and fromMeals)
      setItems(dbItems);

      if (mealIds.length > 0) {
        // Only fetch minimal meal data (id, name) for display
        const { data: mealsData } = await supabase
          .from("saved_meals")
          .select("id, name")
          .in("id", mealIds);

        if (mealsData) {
          setMealMetadata(mealsData as MealMetadata[]);
        }
      } else {
        setMealMetadata([]);
      }
    } else {
      setItems([]);
      setMealMetadata([]);
    }
  }, []);

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

          // Add all meals in parallel for better performance
          await Promise.all(
            parsedMeals.map((meal: Meal) => addMealToShoppingList(meal))
          );

          // Clear sessionStorage
          sessionStorage.removeItem("selectedMeals");

          // Reload shopping list from database
          await loadShoppingList();
        } catch (error) {
          console.error("Error saving shopping list:", error);
        }
      } else {
        // Load existing shopping list
        await loadShoppingList();
      }

      setLoading(false);
    }
    init();
  }, [loadShoppingList]);

  async function handleClearList() {
    if (!confirm("Are you sure you want to clear your messages?")) {
      return;
    }

    // Optimistic update - clear UI immediately
    const previousItems = items;
    const previousMetadata = mealMetadata;

    setItems([]);
    setMealMetadata([]);
    setToastMessage("Messages cleared");
    setShowToast(true);

    // Call server action in background
    const result = await clearShoppingList();

    // If it failed, revert
    if (result.error) {
      setItems(previousItems);
      setMealMetadata(previousMetadata);
      setToastMessage("Failed to clear your messages");
      setShowToast(true);
    }
  }

  async function handleToggleItem(itemIndex: number, currentChecked: boolean) {
    // Optimistic update - update UI immediately
    const newChecked = !currentChecked;
    setItems((prevItems) => {
      const updated = [...prevItems];
      updated[itemIndex] = { ...updated[itemIndex], checked: newChecked };
      return updated;
    });

    // Call server action in background
    const result = await updateShoppingListItem(itemIndex, newChecked);

    // Only revert and show error if it failed
    if (result.error) {
      setItems((prevItems) => {
        const reverted = [...prevItems];
        reverted[itemIndex] = { ...reverted[itemIndex], checked: currentChecked };
        return reverted;
      });
      setToastMessage("Failed to update item");
      setShowToast(true);
    }
  }

  async function handleRemoveMeal(mealId: string) {
    // Optimistic update - remove items from UI immediately
    const previousItems = items;
    const previousMetadata = mealMetadata;

    setItems((prevItems) => prevItems.filter((item) => !item.fromMeals.some((mealName) => {
      const metadata = previousMetadata.find((m) => m.id === mealId);
      return metadata && mealName === metadata.name;
    })));
    setMealMetadata((prevMetadata) => prevMetadata.filter((m) => m.id !== mealId));
    setToastMessage("Meal removed from your messages");
    setShowToast(true);

    // Call server action in background
    const result = await removeMealFromShoppingList(mealId);

    // If it failed, revert and show error
    if (result.error) {
      setItems(previousItems);
      setMealMetadata(previousMetadata);
      setToastMessage("Failed to remove meal from your messages");
      setShowToast(true);
    }
  }

  async function handleViewMeal(mealId: string) {
    // Open modal immediately with loading state
    setSelectedMealForDetail({} as Meal);

    // Load meal data in background
    const result = await getMealById(mealId);
    if (result.data) {
      setSelectedMealForDetail(result.data);
    } else {
      setSelectedMealForDetail(null);
      setToastMessage("Failed to load meal details");
      setShowToast(true);
    }
  }

  function handleCopySuccess() {
    setToastMessage("Messages copied to clipboard!");
    setShowToast(true);
  }

  function handleListShareSuccess() {
    setToastMessage("Messages shared!");
    setShowToast(true);
  }

  function handleShareSuccess() {
    setToastMessage("Recipe link copied to clipboard!");
    setShowToast(true);
  }

  return (
    <div className="min-h-screen bg-peat-50">
      <Header userEmail={userEmail} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-peat-900 mb-2">
            Your Messages
          </h1>
          <p className="text-peat-600">
            Your ingredients, ready for the shop
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
        ) : items.length === 0 ? (
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
              Head to New Recipes to generate meals and select the ones you
              want to cook this week.
            </p>
            <button
              onClick={() => router.push("/new")}
              className="btn-primary"
            >
              Browse New Recipes
            </button>
          </div>
        ) : (
          <div className="card">
            <ShoppingList
              items={items}
              mealMetadata={mealMetadata}
              onToggleItem={handleToggleItem}
              onClear={handleClearList}
              onRemoveMeal={handleRemoveMeal}
              onViewMeal={handleViewMeal}
              onCopySuccess={handleCopySuccess}
              onShareSuccess={handleListShareSuccess}
            />
          </div>
        )}
      </main>

      {selectedMealForDetail && (
        <MealDetailModal
          meal={selectedMealForDetail}
          isOpen={true}
          onClose={() => setSelectedMealForDetail(null)}
          showShareButton={true}
          onShareSuccess={handleShareSuccess}
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
