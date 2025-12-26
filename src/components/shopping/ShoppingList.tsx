"use client";

import { useMemo } from "react";
import { ShoppingListItem, IngredientCategory } from "@/types";
import { groupBy, capitalise, cn } from "@/lib/utils";
import { updateShoppingListItem } from "@/app/actions/meals";

interface MealMetadata {
  id: string;
  name: string;
}

interface ShoppingListProps {
  items: ShoppingListItem[];
  mealMetadata: MealMetadata[];
  onClear?: () => void;
  onRemoveMeal?: (mealId: string) => void;
  onViewMeal?: (mealId: string) => void;
}

const categoryOrder: IngredientCategory[] = [
  "produce",
  "dairy",
  "meat",
  "fish",
  "bakery",
  "frozen",
  "storecupboard",
];

const categoryEmojis: Record<IngredientCategory, string> = {
  produce: "🥬",
  dairy: "🧈",
  meat: "🥩",
  fish: "🐟",
  bakery: "🍞",
  frozen: "🧊",
  storecupboard: "🫙",
};

export function ShoppingList({ items, mealMetadata, onClear, onRemoveMeal, onViewMeal }: ShoppingListProps) {
  const groupedItems = useMemo(() => {
    const grouped = groupBy(items, "category");
    // Sort by category order
    const sorted: Record<string, ShoppingListItem[]> = {};
    categoryOrder.forEach((cat) => {
      if (grouped[cat]) {
        sorted[cat] = grouped[cat].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      }
    });
    return sorted;
  }, [items]);

  // Create a map from meal name to meal ID for quick lookups
  const mealNameToId = useMemo(() => {
    const map: Record<string, string> = {};
    mealMetadata.forEach((meal) => {
      map[meal.name] = meal.id;
    });
    return map;
  }, [mealMetadata]);

  async function toggleItem(itemIndex: number, currentChecked: boolean) {
    // Update database (server action handles revalidation)
    await updateShoppingListItem(itemIndex, !currentChecked);
  }

  function copyToClipboard() {
    const text = Object.entries(groupedItems)
      .map(([category, categoryItems]) => {
        const header = `${capitalise(category)}:`;
        const itemLines = categoryItems
          .map((item) => `  • ${item.name} (${item.quantity})`)
          .join("\n");
        return `${header}\n${itemLines}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(text);
  }

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl text-peat-900">
            Your Messages
          </h2>
          <p className="text-sm text-peat-600">
            {checkedCount} of {totalCount} items ticked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="btn-secondary text-sm"
            aria-label="Copy shopping list to clipboard"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="btn-ghost text-sm text-red-600"
              aria-label="Clear entire shopping list"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Meals included */}
      <div className="mb-6 p-4 rounded-lg bg-brine-50 border border-brine-200">
        <p className="text-sm font-medium text-brine-800 mb-2">
          Shopping for {mealMetadata.length} meal{mealMetadata.length !== 1 ? 's' : ''}:
        </p>
        <div className="flex flex-wrap gap-2">
          {mealMetadata.map((meal) => (
            <div
              key={meal.id}
              className="group text-xs px-2 py-1 rounded bg-white text-brine-700 border border-brine-200 flex items-center gap-1"
            >
              <button
                onClick={() => onViewMeal?.(meal.id)}
                className="hover:underline cursor-pointer"
                aria-label={`View recipe for ${meal.name}`}
              >
                {meal.name}
              </button>
              {onRemoveMeal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove "${meal.name}" from shopping list?`)) {
                      onRemoveMeal(meal.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                  aria-label={`Remove ${meal.name} from shopping list`}
                >
                  <svg
                    className="w-3 h-3"
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
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shopping list by category */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            <h3 className="flex items-center gap-2 font-medium text-peat-800 mb-3">
              <span>{categoryEmojis[category as IngredientCategory]}</span>
              {capitalise(category)}
              <span className="text-sm font-normal text-peat-500">
                ({categoryItems.length})
              </span>
            </h3>
            <ul className="space-y-2">
              {categoryItems.map((item, idx) => {
                // Find the actual index in the full items array for server action
                const itemIndex = items.findIndex(
                  (i) => i.name === item.name && i.category === item.category
                );

                return (
                  <li
                    key={`${item.name}-${item.category}-${idx}`}
                    onClick={() => toggleItem(itemIndex, item.checked)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      item.checked
                        ? "bg-peat-100 text-peat-500"
                        : "bg-white hover:bg-peat-50"
                    )}
                    role="checkbox"
                    aria-checked={item.checked}
                    aria-label={`${item.name}, ${item.quantity}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleItem(itemIndex, item.checked);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        item.checked
                          ? "bg-brine-500 border-brine-500"
                          : "border-peat-300"
                      )}
                    >
                      {item.checked && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "font-medium",
                          item.checked && "line-through"
                        )}
                      >
                        {item.name}
                      </span>
                      <span className="text-peat-500 ml-2">
                        ({item.quantity})
                      </span>
                      {item.fromMeals.length > 1 && (
                        <p className="text-xs text-peat-400 mt-0.5">
                          For:{" "}
                          {item.fromMeals.map((mealName, idx) => (
                            <span key={mealName}>
                              {idx > 0 && ", "}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const mealId = mealNameToId[mealName];
                                  if (mealId && onViewMeal) {
                                    onViewMeal(mealId);
                                  }
                                }}
                                className="hover:underline cursor-pointer hover:text-peat-600"
                                title="View recipe"
                              >
                                {mealName}
                              </button>
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
