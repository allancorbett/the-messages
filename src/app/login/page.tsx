"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/actions/auth";
import styles from "../auth.module.css";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const authError = searchParams.get("error");

  const [error, setError] = useState<string | null>(
    authError === "auth" ? "Authentication failed. Please try again." : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (redirect) {
      formData.set("redirect", redirect);
    }

    const result = await signIn(formData);

    if (result?.error) {
      const errorMessage =
        "form" in result.error
          ? result.error.form?.[0]
          : Object.values(result.error).flat()[0];
      setError(errorMessage || "An error occurred");
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <h1 className={styles.title}>
              The Messages
            </h1>
          </Link>
          <p className={styles.subtitle}>Sign in to plan your meals</p>
        </div>

        <div className={styles.card}>
          <form action={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={styles.input}
                placeholder="you@example.com"
              />
            </div>

            <div className={styles.field}>
              <div className={styles["label-row"]}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className={styles["forgot-link"]}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles["submit-button"]}
            >
              {loading ? (
                <span className={styles["loading-content"]}>
                  <svg
                    className={styles.spinner}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className={styles["spinner-circle"]}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className={styles["spinner-path"]}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className={styles["footer-text"]}>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className={styles.link}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles["loading-fallback"]}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
