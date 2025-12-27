"use client";

import { Meal } from "@/types";
import {
  formatPrepTime,
  getBudgetSymbol,
  getMealTypeEmoji,
  capitalise,
} from "@/lib/utils";
import React, { useEffect } from "react";
import { Badge } from "@/components/ui";
import styles from "./MealDetailModal.module.css";

interface MealDetailModalProps {
  meal: Meal;
  isOpen: boolean;
  onClose: () => void;
  onAddToShoppingList?: () => void;
  showShareButton?: boolean;
}

export function MealDetailModal({
  meal,
  isOpen,
  onClose,
  onAddToShoppingList,
  showShareButton = false,
}: MealDetailModalProps) {
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleShare = async () => {
    if (!meal.id) return;

    const url = `${window.location.origin}/recipe/${meal.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles["header-content"]}>
            <div className={styles["header-badges"]}>
              <span className={styles.emoji} aria-hidden>
                {getMealTypeEmoji(meal.mealType)}
              </span>
              <Badge
                variant={
                  meal.priceLevel === 1
                    ? "economic"
                    : meal.priceLevel === 2
                      ? "mid"
                      : "fancy"
                }
              >
                {getBudgetSymbol(meal.priceLevel)}
              </Badge>
              <span className={styles["meal-type"]}>
                {capitalise(meal.mealType)}
              </span>
            </div>
            <h2 className={styles.title}>
              {meal.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={styles["close-button"]}
            aria-label="Close modal"
          >
            <svg
              className={styles["close-icon"]}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Action buttons */}
          {(onAddToShoppingList || showShareButton) && (
            <div className={styles.actions}>
              {onAddToShoppingList && (
                <button
                  onClick={onAddToShoppingList}
                  className={styles["primary-button"]}
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
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Add to Shopping List
                </button>
              )}
              {showShareButton && meal.id && (
                <button
                  onClick={handleShare}
                  className={styles["secondary-button"]}
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
                      Share
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Description */}
          <p className={styles.description}>{meal.description}</p>

          {/* Meta info */}
          <div className={styles.meta}>
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

          {/* Ingredients */}
          <div className={styles.section}>
            <h3 className={styles["section-title"]}>
              Ingredients
            </h3>
            <div className={styles.categories}>
              {categoryOrder.map((category) => {
                const items = ingredientsByCategory[category];
                if (!items || items.length === 0) return null;

                return (
                  <div key={category}>
                    <h4 className={styles["category-title"]}>
                      {capitalise(category)}
                    </h4>
                    <ul className={styles["ingredient-list"]}>
                      {items.map((ingredient, idx) => (
                        <li
                          key={idx}
                          className={styles.ingredient}
                        >
                          <span className={styles.bullet}>•</span>
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
          </div>

          {/* Instructions */}
          <div className={styles.section}>
            <h3 className={styles["section-title"]}>
              Instructions
            </h3>
            <ol className={styles.instructions}>
              {meal.instructions.map((instruction, idx) => (
                <li key={idx} className={styles.instruction}>
                  <span className={styles["step-number"]}>
                    {idx + 1}
                  </span>
                  <p className={styles["instruction-text"]}>{instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
