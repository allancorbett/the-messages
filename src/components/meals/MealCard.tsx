"use client";

import { Meal } from "@/types";
import {
  formatPrepTime,
  getBudgetSymbol,
  getMealTypeEmoji,
  capitalise,
  cn,
} from "@/lib/utils";

interface MealCardProps {
  meal: Meal;
  selected?: boolean;
  onSelect?: (meal: Meal) => void;
  onSave?: (meal: Meal) => void;
  onViewDetails?: (meal: Meal) => void;
  showCheckbox?: boolean;
  showSaveButton?: boolean;
  showShareButton?: boolean;
  showFavouriteButton?: boolean;
  showDeleteButton?: boolean;
  onShareSuccess?: () => void;
  onToggleFavourite?: (mealId: string) => void;
  onDelete?: (mealId: string) => void;
  className?: string;
}

export function MealCard({
  meal,
  selected = false,
  onSelect,
  onSave,
  onViewDetails,
  showCheckbox = true,
  showSaveButton = false,
  showShareButton = false,
  showFavouriteButton = false,
  showDeleteButton = false,
  onShareSuccess,
  onToggleFavourite,
  onDelete,
  className,
}: MealCardProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!meal.id) return;

    const url = `${window.location.origin}/recipe/${meal.id}`;
    try {
      await navigator.clipboard.writeText(url);
      onShareSuccess?.();
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleToggleFavourite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!meal.id) return;
    onToggleFavourite?.(meal.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!meal.id) return;
    onDelete?.(meal.id);
  };

  return (
    <div
      className={cn(
        "card group transition-all cursor-pointer hover:shadow-md",
        selected && "ring-2 ring-brine-500 bg-brine-50/50 dark:bg-brine-900/20",
        className
      )}
      onClick={() => onSelect?.(meal)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg" aria-hidden>
              {getMealTypeEmoji(meal.mealType)}
            </span>
            <span
              className={cn(
                "badge",
                meal.priceLevel === 1 && "badge-economic",
                meal.priceLevel === 2 && "badge-mid",
                meal.priceLevel === 3 && "badge-fancy"
              )}
            >
              {getBudgetSymbol(meal.priceLevel)}
            </span>
            <span className="text-xs text-peat-500 dark:text-peat-400">
              {capitalise(meal.mealType)}
            </span>
          </div>

          <h3 className="font-medium text-peat-900 dark:text-peat-50 mb-1 group-hover:text-brine-700 dark:group-hover:text-brine-400 transition-colors">
            {meal.name}
          </h3>

          <p className="text-sm text-peat-600 dark:text-peat-300 line-clamp-2 mb-3">
            {meal.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-peat-500 dark:text-peat-400 mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
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
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
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
              {meal.servings} servings
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
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
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
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

          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(meal);
              }}
              className="text-xs text-brine-600 dark:text-brine-400 hover:text-brine-700 dark:hover:text-brine-300 font-medium flex items-center gap-1"
            >
              View full recipe
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
          {showCheckbox && (
            <div
              className={cn(
                "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                selected
                  ? "bg-brine-500 border-brine-500"
                  : "border-peat-300 dark:border-peat-600 group-hover:border-peat-400 dark:group-hover:border-peat-500"
              )}
              aria-label={selected ? "Selected" : "Not selected"}
            >
              {selected && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          )}

          {showSaveButton && onSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(meal);
              }}
              className="p-1.5 rounded-lg text-peat-400 dark:text-peat-500 hover:text-brine-600 dark:hover:text-brine-400 hover:bg-brine-50 dark:hover:bg-brine-900/20 transition-colors flex-shrink-0"
              aria-label="Save meal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          )}

          {showFavouriteButton && meal.id && (
            <button
              onClick={handleToggleFavourite}
              className={cn(
                "p-1.5 rounded-lg transition-colors flex-shrink-0",
                meal.isFavourite
                  ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "text-peat-400 dark:text-peat-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              )}
              aria-label={meal.isFavourite ? "Remove from favourites" : "Add to favourites"}
            >
              <svg
                className="w-5 h-5"
                fill={meal.isFavourite ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}

          {showShareButton && meal.id && (
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-peat-400 dark:text-peat-500 hover:text-brine-600 dark:hover:text-brine-400 hover:bg-brine-50 dark:hover:bg-brine-900/20 transition-colors flex-shrink-0"
              aria-label="Share recipe link"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          )}

          {showDeleteButton && meal.id && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-peat-400 dark:text-peat-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
              aria-label="Delete meal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
