"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKING_VERBS = [
  "Baked",
  "Prepared",
  "Cooked",
  "Seasoned",
  "Crafted",
  "Whisked",
  "Stirred",
  "Kneaded",
  "Simmered",
  "Grilled",
  "Roasted",
  "Sautéed",
  "Assembled",
  "Plated",
  "Garnished",
  "Infused",
  "Marinated",
  "Blended",
  "Braised",
  "Steamed",
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
      <div className="max-w-7xl mx-auto text-end">
        <p className="text-sm text-peat-600">
           <span className="inline min-w-[120px] animate-fade-in duration-300">
            {verb}
          </span> by seasonal ingredients, AI and {" "}
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
