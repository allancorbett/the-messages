"use client";

import { Meal } from "@/types";
import {
  formatPrepTime,
  getBudgetSymbol,
  getMealTypeEmoji,
  capitalise,
  cn,
} from "@/lib/utils";
import { Badge } from "@/components/ui";
import styles from "./MealCard.module.css";

interface MealCardProps {
  meal: Meal;
  selected?: boolean;
  onSelect?: (meal: Meal) => void;
  onSave?: (meal: Meal) => void;
  onViewDetails?: (meal: Meal) => void;
  showCheckbox?: boolean;
  showSaveButton?: boolean;
  showShareButton?: boolean;
  onShareSuccess?: () => void;
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
  onShareSuccess,
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

  const getBadgeVariant = () => {
    if (meal.priceLevel === 1) return "economic";
    if (meal.priceLevel === 2) return "mid";
    return "fancy";
  };

  return (
    <div
      className={cn(
        styles["meal-card"],
        selected && styles.selected,
        className
      )}
      onClick={() => onSelect?.(meal)}
    >
      <div className={styles["card-content"]}>
        <div className={styles["main-info"]}>
          <div className={styles.header}>
            <span className={styles.emoji} aria-hidden>
              {getMealTypeEmoji(meal.mealType)}
            </span>
            <Badge variant={getBadgeVariant()}>
              {getBudgetSymbol(meal.priceLevel)}
            </Badge>
            <span className={styles["meal-type"]}>
              {capitalise(meal.mealType)}
            </span>
          </div>

          <h3 className={styles.title}>{meal.name}</h3>

          <p className={styles.description}>{meal.description}</p>

          <div className={styles.meta}>
            <span className={styles["meta-item"]}>
              <svg
                className={styles.icon}
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
                className={styles.icon}
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
            <span className={styles["meta-item"]}>
              <svg
                className={styles.icon}
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

          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(meal);
              }}
              className={styles["view-details"]}
            >
              View full recipe
              <svg
                className={styles.icon}
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

        <div className={styles.actions}>
          {showCheckbox && (
            <div
              className={cn(styles.checkbox, selected && styles.checked)}
              aria-label={selected ? "Selected" : "Not selected"}
            >
              {selected && (
                <svg
                  className={styles["checkbox-icon"]}
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
              className={styles["action-button"]}
              aria-label="Save meal"
            >
              <svg
                className={styles["button-icon"]}
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

          {showShareButton && meal.id && (
            <button
              onClick={handleShare}
              className={styles["action-button"]}
              aria-label="Share recipe link"
            >
              <svg
                className={styles["button-icon"]}
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
        </div>
      </div>
    </div>
  );
}
