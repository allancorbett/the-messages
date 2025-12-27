"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ShoppingList } from "@/components/shopping/ShoppingList";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { Meal, ShoppingListItem } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  addMealToShoppingList,
  getShoppingList,
  clearShoppingList,
  removeMealFromShoppingList,
  getMealById,
} from "@/app/actions/meals";
import { Card, EmptyState, LoadingContainer, LoadingSkeleton } from "@/components/ui";
import styles from "./page.module.css";

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
    if (!confirm("Are you sure you want to clear your entire shopping list?")) {
      return;
    }

    const result = await clearShoppingList();
    if (result.error) {
      alert("Failed to clear shopping list");
    } else {
      setItems([]);
      setMealMetadata([]);
    }
  }

  async function handleRemoveMeal(mealId: string) {
    const result = await removeMealFromShoppingList(mealId);
    if (result.error) {
      alert("Failed to remove meal from shopping list");
    } else {
      // Reload shopping list from database
      await loadShoppingList();
    }
  }

  async function handleViewMeal(mealId: string) {
    const result = await getMealById(mealId);
    if (result.data) {
      setSelectedMealForDetail(result.data);
    } else {
      alert("Failed to load meal details");
    }
  }

  return (
    <div className={styles.page}>
      <Header userEmail={userEmail} />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Shopping List
          </h1>
          <p className={styles.subtitle}>
            Your aggregated ingredients, ready for the shop
          </p>
        </div>

        {loading ? (
          <Card>
            <LoadingContainer>
              <LoadingSkeleton variant="title" />
              <LoadingSkeleton variant="text-long" />
              <LoadingSkeleton variant="text-medium" />
            </LoadingContainer>
          </Card>
        ) : items.length === 0 ? (
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              title="No meals selected"
              description="Head to the Plan page to generate meals and select the ones you want to cook this week."
              action={{
                label: "Plan Meals",
                onClick: () => router.push("/plan"),
              }}
            />
          </Card>
        ) : (
          <Card>
            <ShoppingList
              items={items}
              mealMetadata={mealMetadata}
              onClear={handleClearList}
              onRemoveMeal={handleRemoveMeal}
              onViewMeal={handleViewMeal}
            />
          </Card>
        )}
      </main>

      {selectedMealForDetail && (
        <MealDetailModal
          meal={selectedMealForDetail}
          isOpen={true}
          onClose={() => setSelectedMealForDetail(null)}
          showShareButton={true}
        />
      )}
    </div>
  );
}
