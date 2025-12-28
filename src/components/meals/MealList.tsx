"use client";

import { Meal } from "@/types";
import { MealCard } from "./MealCard";

interface MealListProps {
  meals: Meal[];
  selectedMeals: Meal[];
  onToggleSelect: (meal: Meal) => void;
  onSave?: (meal: Meal) => void;
  onViewDetails?: (meal: Meal) => void;
  loading?: boolean;
  showShareButton?: boolean;
  onShareSuccess?: () => void;
}

export function MealList({
  meals,
  selectedMeals,
  onToggleSelect,
  onSave,
  onViewDetails,
  loading = false,
  showShareButton = false,
  onShareSuccess,
}: MealListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-peat-200" />
                  <div className="w-12 h-5 rounded bg-peat-200" />
                </div>
                <div className="h-5 w-3/4 rounded bg-peat-200 mb-2" />
                <div className="h-4 w-full rounded bg-peat-200 mb-1" />
                <div className="h-4 w-2/3 rounded bg-peat-200 mb-3" />
                <div className="flex gap-4">
                  <div className="h-4 w-16 rounded bg-peat-200" />
                  <div className="h-4 w-20 rounded bg-peat-200" />
                </div>
              </div>
              <div className="w-6 h-6 rounded bg-peat-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-peat-900 mb-1">No meals yet</h3>
        <p className="text-peat-600">
          Set your preferences and generate some meal ideas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map((meal, index) => (
        <div
          key={meal.id || index}
          className={`opacity-0 animate-slide-up stagger-${Math.min(index + 1, 10)}`}
          style={{ animationFillMode: "forwards" }}
        >
          <MealCard
            meal={meal}
            selected={selectedMeals.some((m) => m.id === meal.id)}
            onSelect={onToggleSelect}
            onSave={onSave}
            onViewDetails={onViewDetails}
            showSaveButton={!!onSave}
            showShareButton={showShareButton}
            onShareSuccess={onShareSuccess}
          />
        </div>
      ))}
    </div>
  );
}
