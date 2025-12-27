"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

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
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.text}>
          <span className={styles.verb}>
            {verb}
          </span>{" "}
          <Link
            href="https://superallan.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Allan Corbett
          </Link>
        </p>
      </div>
    </footer>
  );
}
