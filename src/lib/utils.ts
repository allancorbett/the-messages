import { Season } from "@/types";

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function getSeasonEmoji(season: Season): string {
  const emojis: Record<Season, string> = {
    spring: "🌱",
    summer: "☀️",
    autumn: "🍂",
    winter: "❄️",
  };
  return emojis[season];
}

export function getBudgetLabel(level: 1 | 2 | 3): string {
  const labels = {
    1: "Economic",
    2: "Mid-range",
    3: "Fancy",
  };
  return labels[level];
}

export function getBudgetSymbol(level: 1 | 2 | 3): string {
  return "£".repeat(level);
}

export function getMealTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
  };
  return emojis[type] || "🍽️";
}

export function formatPrepTime(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
