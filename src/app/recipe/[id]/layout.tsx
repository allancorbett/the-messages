import type { Metadata } from "next";
import { getMealById } from "@/app/actions/meals";
import { formatPrepTime, getBudgetSymbol } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-messages.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getMealById(id);

  if (result.error || !result.data) {
    return {
      title: "Recipe Not Found",
      description: "This recipe could not be found.",
    };
  }

  const meal = result.data;
  const budgetSymbol = getBudgetSymbol(meal.priceLevel);
  const prepTime = formatPrepTime(meal.prepTime);

  const title = `${meal.name}`;
  const description = `${meal.description} • ${prepTime} • Serves ${meal.servings} • ${budgetSymbol}`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      url: `${siteUrl}/recipe/${id}`,
      title,
      description,
      siteName: "The Messages",
      locale: "en_GB",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: meal.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function RecipeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
