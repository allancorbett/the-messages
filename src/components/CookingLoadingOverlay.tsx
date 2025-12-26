"use client";

import { useEffect, useState } from "react";

const COOKING_MESSAGES = [
  "Stirring…",
  "Kneading…",
  "Buttering…",
  "Whisking…",
  "Chopping…",
  "Dicing…",
  "Slicing…",
  "Mincing…",
  "Grating…",
  "Peeling…",
  "Seasoning…",
  "Tasting…",
  "Simmering…",
  "Boiling…",
  "Sautéing…",
  "Roasting…",
  "Baking…",
  "Grilling…",
  "Toasting…",
  "Frying…",
  "Steaming…",
  "Blanching…",
  "Braising…",
  "Poaching…",
  "Mixing…",
  "Folding…",
  "Blending…",
  "Pureeing…",
  "Marinating…",
  "Glazing…",
  "Reducing…",
  "Caramelizing…",
  "Browning…",
  "Searing…",
  "Flipping…",
  "Drizzling…",
  "Sprinkling…",
  "Garnishing…",
  "Plating…",
  "Measuring…",
  "Preheating…",
  "Melting…",
  "Crushing…",
  "Grinding…",
  "Zesting…",
  "Juicing…",
  "Squeezing…",
  "Rolling…",
  "Shaping…",
  "Scoring…",
  "Basting…",
  "Brushing…",
  "Spicing…",
  "Infusing…",
  "Deglazing…",
  "Emulsifying…",
  "Tempering…",
  "Proofing…",
  "Rising…",
  "Fermenting…",
  "Pickling…",
  "Curing…",
  "Smoking…",
  "Charring…",
  "Flambéing…",
  "Julienning…",
  "Chiffonading…",
  "Brunoise-ing…",
  "Trimming…",
  "Deveining…",
  "Deboning…",
  "Filleting…",
  "Cracking…",
  "Separating…",
  "Beating…",
  "Creaming…",
  "Sifting…",
  "Dusting…",
  "Coating…",
  "Breading…",
  "Battering…",
  "Tenderizing…",
  "Pounding…",
  "Resting…",
  "Chilling…",
  "Freezing…",
  "Thawing…",
  "Warming…",
  "Cooling…",
  "Straining…",
  "Draining…",
  "Patting dry…",
  "Rinsing…",
  "Soaking…",
  "Hydrating…",
  "Dissolving…",
  "Incorporating…",
  "Combining…",
  "Layering…",
  "Stacking…",
  "Arranging…",
];

interface CookingLoadingOverlayProps {
  isLoading: boolean;
}

export function CookingLoadingOverlay({ isLoading }: CookingLoadingOverlayProps) {
  const [currentMessage, setCurrentMessage] = useState(COOKING_MESSAGES[0]);

  useEffect(() => {
    if (!isLoading) return;

    // Prevent scrolling when overlay is shown
    document.body.style.overflow = "hidden";

    // Set initial random message
    setCurrentMessage(COOKING_MESSAGES[Math.floor(Math.random() * COOKING_MESSAGES.length)]);

    // Change message every 1500ms
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * COOKING_MESSAGES.length);
      setCurrentMessage(COOKING_MESSAGES[randomIndex]);
    }, 1500);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-peat-900/95 to-brine-900/95 backdrop-blur-sm">
      <div className="text-center px-4">
        {/* Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-oat-200/30"></div>

          {/* Spinning ring */}
          <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-oat-400 border-r-oat-400 animate-spin"></div>

          {/* Inner glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-oat-400/20 to-brine-400/20 animate-pulse"></div>
          </div>
        </div>

        {/* Loading message */}
        <div className="relative h-12 flex items-center justify-center">
          <p
            key={currentMessage}
            className="text-2xl font-display text-oat-100 animate-fade-in"
          >
            {currentMessage}
          </p>
        </div>

        {/* Subtitle */}
        <p className="mt-4 text-sm text-oat-300/80">
          Crafting your personalised meal suggestions
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
