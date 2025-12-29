import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-messages.vercel.app";

export const metadata: Metadata = {
  title: "Your Messages",
  description:
    "Organised shopping list with ingredients grouped by supermarket section. Get the messages sorted efficiently.",
  openGraph: {
    type: "website",
    url: `${siteUrl}/messages`,
    title: "Your Messages | The Messages",
    description:
      "Organised shopping list with ingredients grouped by supermarket section. Get the messages sorted efficiently.",
    siteName: "The Messages",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Messages - Your Messages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Messages | The Messages",
    description:
      "Organised shopping list with ingredients grouped by supermarket section.",
    images: ["/og-image.png"],
  },
};

export default function ShoppingListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
