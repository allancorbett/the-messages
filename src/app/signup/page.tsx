"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import styles from "../auth.module.css";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await signUp(formData);

    if (result?.error) {
      const errorMessage =
        "form" in result.error
          ? result.error.form?.[0]
          : Object.values(result.error).flat()[0];
      setError(errorMessage || "An error occurred");
      setLoading(false);
    } else if (result?.success) {
      setSuccess(result.message || "Account created successfully");
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
          <p className={styles.subtitle}>Create your account</p>
        </div>

        <div className={styles.card}>
          {success ? (
            <div className={styles["success-container"]}>
              <div className={styles["success-icon-container"]}>
                <svg
                  className={styles["success-icon"]}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className={styles["success-title"]}>
                Check your email
              </h2>
              <p className={styles["success-message"]}>{success}</p>
              <Link href="/login" className={styles["secondary-button"]}>
                Back to sign in
              </Link>
            </div>
          ) : (
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
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={styles.input}
                  placeholder="••••••••"
                />
                <p className={styles.hint}>
                  At least 8 characters with uppercase, lowercase, and a number
                </p>
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
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          )}

          {!success && (
            <p className={styles["footer-text"]}>
              Already have an account?{" "}
              <Link
                href="/login"
                className={styles.link}
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
