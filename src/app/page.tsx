import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentSeason, getSeasonEmoji, capitalise } from "@/lib/utils";
import styles from "./page.module.css";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, redirect to plan page
  if (user) {
    redirect("/plan");
  }

  const season = getCurrentSeason();

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.logo}>The Messages</h1>
        <div className={styles["header-actions"]}>
          <Link href="/login" className={styles["ghost-button"]}>
            Sign in
          </Link>
          <Link href="/signup" className={styles["primary-button"]}>
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.badge}>
            {getSeasonEmoji(season)} {capitalise(season)} ingredients in season
          </div>

          <h2 className={styles["hero-title"]}>
            Get the messages
            <span className={styles["hero-title-accent"]}> sorted</span>
          </h2>

          <p className={styles["hero-description"]}>
            Seasonal meal planning for your area. Pick your preferences, get 10
            meal ideas, and generate your shopping list — all based on
            what&apos;s good right now.
          </p>

          <div className={styles["hero-actions"]}>
            <Link href="/signup" className={styles["hero-button"]}>
              Start planning
              <svg
                className={styles["hero-button-icon"]}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link href="/login" className={styles["secondary-button"]}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles["feature-card"]}>
            <div className={`${styles["feature-icon-container"]} ${styles.brine}`}>
              <svg
                className={`${styles["feature-icon"]} ${styles.brine}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className={styles["feature-title"]}>
              Seasonal First
            </h3>
            <p className={styles["feature-description"]}>
              Meals designed around what&apos;s actually good right now in your
              local supermarkets. Better taste, better value.
            </p>
          </div>

          <div className={styles["feature-card"]}>
            <div className={`${styles["feature-icon-container"]} ${styles.oat}`}>
              <svg
                className={`${styles["feature-icon"]} ${styles.oat}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className={styles["feature-title"]}>
              Budget Friendly
            </h3>
            <p className={styles["feature-description"]}>
              Choose economic, mid-range, or fancy. Get meals that match your
              budget without compromising on flavour.
            </p>
          </div>

          <div className={styles["feature-card"]}>
            <div className={`${styles["feature-icon-container"]} ${styles.heather}`}>
              <svg
                className={`${styles["feature-icon"]} ${styles.heather}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className={styles["feature-title"]}>
              One-Tap Shopping List
            </h3>
            <p className={styles["feature-description"]}>
              Select your meals, get an aggregated shopping list grouped by
              aisle. Copy it or tick items off as you go.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className={styles["how-it-works"]}>
          <h3 className={styles["section-title"]}>
            How it works
          </h3>
          <div className={styles.steps}>
            {[
              {
                step: "1",
                title: "Set preferences",
                desc: "Choose meal types, budget, and servings",
              },
              {
                step: "2",
                title: "Generate meals",
                desc: "Get 10 seasonal suggestions instantly",
              },
              {
                step: "3",
                title: "Pick your favourites",
                desc: "Select which meals you want to make",
              },
              {
                step: "4",
                title: "Get the messages",
                desc: "Copy your combined shopping list",
              },
            ].map((item) => (
              <div key={item.step} className={styles.step}>
                <div className={styles["step-number"]}>
                  {item.step}
                </div>
                <h4 className={styles["step-title"]}>{item.title}</h4>
                <p className={styles["step-description"]}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles["footer-content"]}>
          <p>
            Powered by seasonal ingredients and AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
