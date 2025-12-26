import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-messages.vercel.app";

export const metadata: Metadata = {
  title: "Plan Your Meals",
  description:
    "Generate personalised meal plans with seasonal Scottish ingredients. Choose your budget, household size, and dietary preferences.",
  openGraph: {
    type: "website",
    url: `${siteUrl}/plan`,
    title: "Plan Your Meals | The Messages",
    description:
      "Generate personalised meal plans with seasonal Scottish ingredients. Choose your budget, household size, and dietary preferences.",
    siteName: "The Messages",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Messages - Plan Your Meals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan Your Meals | The Messages",
    description:
      "Generate personalised meal plans with seasonal Scottish ingredients.",
    images: ["/og-image.png"],
  },
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
