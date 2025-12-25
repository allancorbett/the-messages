"use client";

import { useState, useMemo } from "react";
import { Meal, ShoppingListItem, IngredientCategory } from "@/types";
import { groupBy, capitalise, cn } from "@/lib/utils";

interface ShoppingListProps {
  meals: Meal[];
  onClear?: () => void;
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

export function ShoppingList({ meals, onClear }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Aggregate ingredients from all meals
  const items = useMemo(() => {
    const ingredientMap = new Map<string, ShoppingListItem>();

    meals.forEach((meal) => {
      meal.ingredients.forEach((ing) => {
        const key = `${ing.name.toLowerCase()}-${ing.category}`;
        const existing = ingredientMap.get(key);

        if (existing) {
          // Try to combine quantities (simplified)
          existing.quantity = `${existing.quantity}, ${ing.quantity}`;
          existing.fromMeals.push(meal.name);
        } else {
          ingredientMap.set(key, {
            ...ing,
            name: ing.name,
            checked: false,
            fromMeals: [meal.name],
          });
        }
      });
    });

    return Array.from(ingredientMap.values());
  }, [meals]);

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

  function toggleItem(itemKey: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
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

  const checkedCount = checkedItems.size;
  const totalCount = items.length;

  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-peat-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-peat-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-peat-900 mb-1">
          No meals selected
        </h3>
        <p className="text-peat-600">
          Select some meals to generate your shopping list
        </p>
      </div>
    );
  }

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
          <button onClick={copyToClipboard} className="btn-secondary text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
            <button onClick={onClear} className="btn-ghost text-sm text-red-600">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Meals included */}
      <div className="mb-6 p-4 rounded-lg bg-brine-50 border border-brine-200">
        <p className="text-sm font-medium text-brine-800 mb-2">
          Shopping for {meals.length} meals:
        </p>
        <div className="flex flex-wrap gap-2">
          {meals.map((meal) => (
            <span
              key={meal.id}
              className="text-xs px-2 py-1 rounded bg-white text-brine-700 border border-brine-200"
            >
              {meal.name}
            </span>
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
              {categoryItems.map((item) => {
                const itemKey = `${item.name}-${item.category}`;
                const isChecked = checkedItems.has(itemKey);

                return (
                  <li
                    key={itemKey}
                    onClick={() => toggleItem(itemKey)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      isChecked
                        ? "bg-peat-100 text-peat-500"
                        : "bg-white hover:bg-peat-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        isChecked
                          ? "bg-brine-500 border-brine-500"
                          : "border-peat-300"
                      )}
                    >
                      {isChecked && (
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
                          isChecked && "line-through"
                        )}
                      >
                        {item.name}
                      </span>
                      <span className="text-peat-500 ml-2">
                        ({item.quantity})
                      </span>
                      {item.fromMeals.length > 1 && (
                        <p className="text-xs text-peat-400 mt-0.5">
                          For: {item.fromMeals.join(", ")}
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
