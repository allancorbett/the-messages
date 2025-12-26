import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-messages.vercel.app";

export const metadata: Metadata = {
  title: "Saved Meals",
  description:
    "Your collection of favourite seasonal recipes. Browse, filter, and share your saved meals.",
  openGraph: {
    type: "website",
    url: `${siteUrl}/saved`,
    title: "Saved Meals | The Messages",
    description:
      "Your collection of favourite seasonal recipes. Browse, filter, and share your saved meals.",
    siteName: "The Messages",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Messages - Saved Meals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saved Meals | The Messages",
    description:
      "Your collection of favourite seasonal recipes.",
    images: ["/og-image.png"],
  },
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
