"use client";

import { Meal } from "@/types";
import { MealCard } from "./MealCard";
import styles from "./MealList.module.css";

interface MealListProps {
  meals: Meal[];
  selectedMeals: Meal[];
  onToggleSelect: (meal: Meal) => void;
  onSave?: (meal: Meal) => void;
  onViewDetails?: (meal: Meal) => void;
  loading?: boolean;
}

export function MealList({
  meals,
  selectedMeals,
  onToggleSelect,
  onSave,
  onViewDetails,
  loading = false,
}: MealListProps) {
  if (loading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles["skeleton-card"]}>
            <div className={styles["skeleton-content"]}>
              <div className={styles["skeleton-main"]}>
                <div className={styles["skeleton-header"]}>
                  <div className={styles["skeleton-icon"]} />
                  <div className={styles["skeleton-badge"]} />
                </div>
                <div className={styles["skeleton-title"]} />
                <div className={styles["skeleton-text"]} />
                <div className={`${styles["skeleton-text"]} ${styles.short}`} />
                <div className={styles["skeleton-meta"]}>
                  <div className={styles["skeleton-meta-item"]} />
                  <div className={`${styles["skeleton-meta-item"]} ${styles.wide}`} />
                </div>
              </div>
              <div className={styles["skeleton-checkbox"]} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className={styles["empty-state"]}>
        <div className={styles["empty-icon-container"]}>
          <svg
            className={styles["empty-icon"]}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
        <h3 className={styles["empty-title"]}>No meals yet</h3>
        <p className={styles["empty-text"]}>
          Set your preferences and generate some meal ideas
        </p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {meals.map((meal, index) => (
        <div
          key={meal.id || index}
          className={styles["meal-item"]}
        >
          <MealCard
            meal={meal}
            selected={selectedMeals.some((m) => m.id === meal.id)}
            onSelect={onToggleSelect}
            onSave={onSave}
            onViewDetails={onViewDetails}
            showSaveButton={!!onSave}
          />
        </div>
      ))}
    </div>
  );
}
