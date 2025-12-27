"use client";

import { useEffect, useState } from "react";
import styles from "./CookingLoadingOverlay.module.css";

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
    <div className={styles.overlay}>
      <div className={styles.content}>
        {/* Spinner */}
        <div className={styles["spinner-container"]}>
          {/* Outer ring */}
          <div className={styles["outer-ring"]}></div>

          {/* Spinning ring */}
          <div className={styles["spinning-ring"]}></div>

          {/* Inner glow */}
          <div className={styles["inner-glow-container"]}>
            <div className={styles["inner-glow"]}></div>
          </div>
        </div>

        {/* Loading message */}
        <div className={styles["message-container"]}>
          <p key={currentMessage} className={styles.message}>
            {currentMessage}
          </p>
        </div>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          Crafting your personalised meal suggestions
        </p>
      </div>
    </div>
  );
}
