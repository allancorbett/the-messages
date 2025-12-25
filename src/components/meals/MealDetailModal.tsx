"use client";

import { Meal } from "@/types";
import {
  formatPrepTime,
  getBudgetSymbol,
  getMealTypeEmoji,
  capitalise,
} from "@/lib/utils";
import { useEffect } from "react";

interface MealDetailModalProps {
  meal: Meal;
  isOpen: boolean;
  onClose: () => void;
  onAddToShoppingList?: () => void;
}

export function MealDetailModal({
  meal,
  isOpen,
  onClose,
  onAddToShoppingList,
}: MealDetailModalProps) {
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-peat-200 px-6 py-4 flex items-start justify-between">
          <div className="flex-1 pr-4">
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
            <h2 className="font-display text-2xl text-peat-900">
              {meal.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-peat-400 hover:text-peat-700 hover:bg-peat-100 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
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
        <div className="px-6 py-6">
          {/* Add to shopping list button */}
          {onAddToShoppingList && (
            <div className="mb-6">
              <button
                onClick={onAddToShoppingList}
                className="btn-primary w-full"
              >
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
                Add to Shopping List
              </button>
            </div>
          )}

          {/* Description */}
          <p className="text-peat-700 mb-6">{meal.description}</p>

          {/* Meta info */}
          <div className="flex items-center gap-6 text-sm text-peat-600 mb-8 pb-6 border-b border-peat-200">
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
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <h3 className="font-display text-xl text-peat-900 mb-4">
              Ingredients
            </h3>
            <div className="space-y-4">
              {categoryOrder.map((category) => {
                const items = ingredientsByCategory[category];
                if (!items || items.length === 0) return null;

                return (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-peat-500 uppercase tracking-wide mb-2">
                      {capitalise(category)}
                    </h4>
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
          <div>
            <h3 className="font-display text-xl text-peat-900 mb-4">
              Instructions
            </h3>
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
        </div>
      </div>
    </div>
  );
}
