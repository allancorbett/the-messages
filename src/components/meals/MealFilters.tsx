"use client";

import { MealType, BudgetLevel, Season } from "@/types";
import {
  getCurrentSeason,
  getSeasonEmoji,
  getBudgetLabel,
  capitalise,
  cn,
} from "@/lib/utils";
import styles from "./MealFilters.module.css";

interface MealFiltersProps {
  season: Season;
  onSeasonChange: (season: Season) => void;
  mealTypes: MealType[];
  onMealTypesChange: (types: MealType[]) => void;
  budget: BudgetLevel;
  onBudgetChange: (budget: BudgetLevel) => void;
  householdSize: number;
  onHouseholdSizeChange: (size: number) => void;
}

const seasons: Season[] = ["spring", "summer", "autumn", "winter"];
const mealTypeOptions: MealType[] = ["breakfast", "lunch", "dinner"];
const budgetLevels: BudgetLevel[] = [1, 2, 3];

export function MealFilters({
  season,
  onSeasonChange,
  mealTypes,
  onMealTypesChange,
  budget,
  onBudgetChange,
  householdSize,
  onHouseholdSizeChange,
}: MealFiltersProps) {
  const currentSeason = getCurrentSeason();

  function toggleMealType(type: MealType) {
    if (mealTypes.includes(type)) {
      if (mealTypes.length > 1) {
        onMealTypesChange(mealTypes.filter((t) => t !== type));
      }
    } else {
      onMealTypesChange([...mealTypes, type]);
    }
  }

  return (
    <div className={styles.container}>
      {/* Season */}
      <div className={styles["filter-section"]}>
        <label className={styles.label}>Season</label>
        <div className={styles["button-group"]}>
          {seasons.map((s) => (
            <button
              key={s}
              onClick={() => onSeasonChange(s)}
              className={cn(
                styles["filter-button"],
                season === s && styles.active
              )}
            >
              {getSeasonEmoji(s)} {capitalise(s)}
              {s === currentSeason && (
                <span className={styles["season-hint"]}>(now)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Types */}
      <div className={styles["filter-section"]}>
        <label className={styles.label}>Meal Types</label>
        <div className={styles["button-group"]}>
          {mealTypeOptions.map((type) => (
            <button
              key={type}
              onClick={() => toggleMealType(type)}
              className={cn(
                styles["filter-button"],
                mealTypes.includes(type) && styles.active
              )}
            >
              {capitalise(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className={styles["filter-section"]}>
        <label className={styles.label}>Budget</label>
        <div className={styles["button-group"]}>
          {budgetLevels.map((level) => (
            <button
              key={level}
              onClick={() => onBudgetChange(level)}
              className={cn(
                styles["filter-button"],
                budget === level && styles.active
              )}
            >
              {"£".repeat(level)} {getBudgetLabel(level)}
            </button>
          ))}
        </div>
      </div>

      {/* Household Size */}
      <div className={styles["filter-section"]}>
        <label className={styles.label}>Servings per Meal</label>
        <div className={styles["size-controls"]}>
          <button
            onClick={() => onHouseholdSizeChange(Math.max(1, householdSize - 1))}
            disabled={householdSize <= 1}
            className={styles["size-button"]}
          >
            −
          </button>
          <span className={styles["size-display"]}>
            {householdSize}
          </span>
          <button
            onClick={() =>
              onHouseholdSizeChange(Math.min(12, householdSize + 1))
            }
            disabled={householdSize >= 12}
            className={styles["size-button"]}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
