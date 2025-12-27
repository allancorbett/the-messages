"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Meal } from "@/types";
import { getMealById } from "@/app/actions/meals";
import {
  formatPrepTime,
  getBudgetSymbol,
  getMealTypeEmoji,
  capitalise,
} from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Card, Badge, LoadingContainer, LoadingSkeleton } from "@/components/ui";
import styles from "./page.module.css";

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

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
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  }

  function addToShoppingList() {
    if (!meal) return;
    sessionStorage.setItem("selectedMeals", JSON.stringify([meal]));
    router.push("/shopping-list");
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Header userEmail={userEmail} />
        <main className={styles.main}>
          <Card>
            <LoadingContainer>
              <LoadingSkeleton variant="title" />
              <LoadingSkeleton variant="text-long" />
              <LoadingSkeleton variant="text-medium" />
            </LoadingContainer>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className={styles.page}>
        <Header userEmail={userEmail} />
        <main className={styles.main}>
          <div className={styles["error-card"]}>
            <h2 className={styles["error-title"]}>
              Recipe Not Found
            </h2>
            <p className={styles["error-message"]}>
              {error || "This recipe could not be found."}
            </p>
            <button onClick={() => router.push("/saved")} className={styles["error-button"]}>
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

  const badgeVariant =
    meal.priceLevel === 1
      ? "economic"
      : meal.priceLevel === 2
        ? "mid"
        : "fancy";

  return (
    <div className={styles.page}>
      <Header userEmail={userEmail} />

      <main className={styles.main}>
        {/* Recipe Header */}
        <Card>
          <div className={styles["card-header"]}>
            <div className={styles["card-header-content"]}>
              <div className={styles["meal-meta-row"]}>
                <span className={styles["meal-emoji"]} aria-hidden>
                  {getMealTypeEmoji(meal.mealType)}
                </span>
                <Badge variant={badgeVariant}>
                  {getBudgetSymbol(meal.priceLevel)}
                </Badge>
                <span className={styles["meal-type-text"]}>
                  {capitalise(meal.mealType)}
                </span>
              </div>
              <h1 className={styles["meal-title"]}>
                {meal.name}
              </h1>
              <p className={styles["meal-description"]}>{meal.description}</p>

              {/* Meta info */}
              <div className={styles["meta-info"]}>
                <span className={styles["meta-item"]}>
                  <svg
                    className={styles["meta-icon"]}
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
                <span className={styles["meta-item"]}>
                  <svg
                    className={styles["meta-icon"]}
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
                <span className={styles["meta-item"]}>
                  <svg
                    className={styles["meta-icon"]}
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
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actions}>
            <button onClick={addToShoppingList} className={styles["button-primary"]}>
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add to Shopping List
            </button>
            <button
              onClick={handleShare}
              className={styles["button-secondary"]}
              title="Copy recipe URL to clipboard"
            >
              {copySuccess ? (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share Recipe
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Ingredients */}
        <Card>
          <h2 className={styles["section-title"]}>
            Ingredients
          </h2>
          <div className={styles["ingredients-container"]}>
            {categoryOrder.map((category) => {
              const items = ingredientsByCategory[category];
              if (!items || items.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className={styles["ingredient-category-title"]}>
                    {capitalise(category)}
                  </h3>
                  <ul className={styles["ingredient-list"]}>
                    {items.map((ingredient, idx) => (
                      <li
                        key={idx}
                        className={styles["ingredient-item"]}
                      >
                        <span className={styles["ingredient-bullet"]}>•</span>
                        <span>
                          <span className={styles["ingredient-quantity"]}>
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
        </Card>

        {/* Instructions */}
        <Card>
          <h2 className={styles["section-title"]}>
            Instructions
          </h2>
          <ol className={styles["instructions-list"]}>
            {meal.instructions.map((instruction, idx) => (
              <li key={idx} className={styles["instruction-item"]}>
                <span className={styles["instruction-number"]}>
                  {idx + 1}
                </span>
                <p className={styles["instruction-text"]}>{instruction}</p>
              </li>
            ))}
          </ol>
        </Card>
      </main>
    </div>
  );
}
