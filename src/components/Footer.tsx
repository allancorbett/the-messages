"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKING_VERBS = [
  "Baked by",
  "Prepared by",
  "Cooked by",
  "Seasoned by",
  "Crafted by",
  "Whisked by",
  "Stirred by",
  "Kneaded by",
  "Simmered by",
  "Grilled by",
  "Roasted by",
  "Sautéed by",
  "Assembled by",
  "Plated by",
  "Garnished by",
  "Infused by",
  "Marinated by",
  "Blended by",
  "Braised by",
  "Steamed by",
];

export function Footer() {
  const [verb, setVerb] = useState(COOKING_VERBS[0]);

  useEffect(() => {
    // Set initial random verb
    setVerb(COOKING_VERBS[Math.floor(Math.random() * COOKING_VERBS.length)]);

    // Change verb every 3 seconds
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * COOKING_VERBS.length);
      setVerb(COOKING_VERBS[randomIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="py-6 px-4 border-t border-peat-200 bg-peat-50">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-peat-600">
          <span className="inline-block min-w-[120px] transition-opacity duration-300">
            {verb}
          </span>{" "}
          <Link
            href="https://superallan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brine-600 hover:text-brine-700 font-medium hover:underline"
          >
            Allan Corbett
          </Link>
        </p>
      </div>
    </footer>
  );
}
