import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Messages | Seasonal Meal Planning",
  description:
    "Plan your weekly meals with seasonal local ingredients. Get the messages sorted.",
  keywords: [
    "meal planning",
    "seasonal cooking",
    "local food",
    "grocery list",
    "recipes",
  ],
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
      <body className="min-h-screen font-body">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
