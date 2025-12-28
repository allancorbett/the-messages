"use client";

import { MealType, BudgetLevel, ComplexityLevel, Season } from "@/types";
import {
  getCurrentSeason,
  getSeasonEmoji,
  getBudgetLabel,
  capitalise,
  cn,
} from "@/lib/utils";

interface MealFiltersProps {
  season: Season;
  onSeasonChange: (season: Season) => void;
  mealTypes: MealType[];
  onMealTypesChange: (types: MealType[]) => void;
  budget: BudgetLevel;
  onBudgetChange: (budget: BudgetLevel) => void;
  complexity: ComplexityLevel;
  onComplexityChange: (complexity: ComplexityLevel) => void;
  householdSize: number;
  onHouseholdSizeChange: (size: number) => void;
}

const seasons: Season[] = ["spring", "summer", "autumn", "winter"];
const mealTypeOptions: MealType[] = ["breakfast", "lunch", "dinner"];
const budgetLevels: BudgetLevel[] = [1, 2, 3];
const complexityLevels: ComplexityLevel[] = ["simple", "moderate", "complex"];

export function MealFilters({
  season,
  onSeasonChange,
  mealTypes,
  onMealTypesChange,
  budget,
  onBudgetChange,
  complexity,
  onComplexityChange,
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
    <div className="space-y-6">
      {/* Season */}
      <div>
        <label className="label">Season</label>
        <div className="flex flex-wrap gap-2">
          {seasons.map((s) => (
            <button
              key={s}
              onClick={() => onSeasonChange(s)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                season === s
                  ? "bg-brine-600 text-white"
                  : "bg-peat-100 text-peat-700 hover:bg-peat-200"
              )}
            >
              {getSeasonEmoji(s)} {capitalise(s)}
              {s === currentSeason && (
                <span className="ml-1 text-xs opacity-70">(now)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Types */}
      <div>
        <label className="label">Meal Types</label>
        <div className="flex flex-wrap gap-2">
          {mealTypeOptions.map((type) => (
            <button
              key={type}
              onClick={() => toggleMealType(type)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                mealTypes.includes(type)
                  ? "bg-brine-600 text-white"
                  : "bg-peat-100 text-peat-700 hover:bg-peat-200"
              )}
            >
              {capitalise(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="label">Budget</label>
        <div className="flex flex-wrap gap-2">
          {budgetLevels.map((level) => (
            <button
              key={level}
              onClick={() => onBudgetChange(level)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                budget === level
                  ? "bg-brine-600 text-white"
                  : "bg-peat-100 text-peat-700 hover:bg-peat-200"
              )}
            >
              {"£".repeat(level)} {getBudgetLabel(level)}
            </button>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <div className={styles["filter-section"]}>
        <label className={styles.label}>Complexity</label>
        <div className={styles["button-group"]}>
          {complexityLevels.map((level) => (
            <button
              key={level}
              onClick={() => onComplexityChange(level)}
              className={cn(
                styles["filter-button"],
                complexity === level && styles.active
              )}
            >
              {capitalise(level)}
            </button>
          ))}
        </div>
      </div>

      {/* Household Size */}
      <div>
        <label className="label">Servings per Meal</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onHouseholdSizeChange(Math.max(1, householdSize - 1))}
            disabled={householdSize <= 1}
            className="w-10 h-10 rounded-lg bg-peat-100 text-peat-700 font-medium hover:bg-peat-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <span className="w-12 text-center font-medium text-peat-900">
            {householdSize}
          </span>
          <button
            onClick={() =>
              onHouseholdSizeChange(Math.min(12, householdSize + 1))
            }
            disabled={householdSize >= 12}
            className="w-10 h-10 rounded-lg bg-peat-100 text-peat-700 font-medium hover:bg-peat-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
