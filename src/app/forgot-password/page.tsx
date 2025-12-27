"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import Link from "next/link";
import styles from "../auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await requestPasswordReset(email);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <div className={styles["success-icon-container"]}>
                <svg
                  className={styles["success-icon"]}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className={styles.title}>
                Check Your Email
              </h1>
              <p className={styles.subtitle}>
                If an account exists with <strong>{email}</strong>, you will
                receive a password reset link shortly.
              </p>
            </div>

            <div className={styles.form}>
              <p className={styles.description}>
                The email may take a few minutes to arrive. Check your spam folder
                if you don&apos;t see it.
              </p>

              <Link href="/login" className={styles["submit-button"]}>
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              Forgot Password?
            </h1>
            <p className={styles.subtitle}>
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.field}>
              <label
                htmlFor="email"
                className={styles.label}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="you@example.com"
                aria-label="Email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles["submit-button"]}
              aria-busy={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className={styles["footer-text"]}>
              <Link
                href="/login"
                className={styles.link}
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
