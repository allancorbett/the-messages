import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-messages.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Messages | Seasonal Meal Planning",
    template: "%s | The Messages",
  },
  description:
    "Plan your weekly meals with seasonal Scottish ingredients. Get the messages sorted.",
  keywords: [
    "meal planning",
    "seasonal cooking",
    "Scottish food",
    "grocery list",
    "recipes",
    "meal prep",
    "shopping list",
    "seasonal recipes",
  ],
  authors: [{ name: "Allan Corbett", url: "https://superallan.com" }],
  creator: "Allan Corbett",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "The Messages",
    title: "The Messages | Seasonal Meal Planning",
    description:
      "Plan your weekly meals with seasonal Scottish ingredients. Get the messages sorted.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Messages - Seasonal Meal Planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Messages | Seasonal Meal Planning",
    description:
      "Plan your weekly meals with seasonal Scottish ingredients. Get the messages sorted.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2c7462",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-body">{children}</body>
    </html>
  );
}
