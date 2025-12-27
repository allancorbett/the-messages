"use client";

import { useState, useEffect } from "react";
import { updatePassword } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "../auth.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if user has a valid password recovery session
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
      setCheckingSession(false);
    }

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain a lowercase letter");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain an uppercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain a number");
      return;
    }

    setLoading(true);

    const result = await updatePassword(password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      // Redirect to plan page after 2 seconds
      setTimeout(() => {
        router.push("/plan");
      }, 2000);
    }
  }

  if (checkingSession) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles["loading-spinner-container"]}>
              <div className={styles["loading-spinner"]}></div>
              <p className={styles["loading-text"]}>Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <div className={styles["error-icon-container"]}>
                <svg
                  className={styles["error-icon"]}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className={styles.title}>
                Invalid or Expired Link
              </h1>
              <p className={styles.subtitle}>
                This password reset link is invalid or has expired. Please request
                a new one.
              </p>
            </div>

            <Link
              href="/forgot-password"
              className={styles["submit-button"]}
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className={styles.title}>
                Password Updated
              </h1>
              <p className={styles.subtitle}>
                Your password has been successfully updated. Redirecting you to
                plan meals...
              </p>
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
              Reset Your Password
            </h1>
            <p className={styles.subtitle}>
              Choose a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div
                className={styles.error}
                role="alert"
              >
                {error}
              </div>
            )}

            <div className={styles.field}>
              <label
                htmlFor="password"
                className={styles.label}
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                aria-label="New password"
              />
              <p className={styles.hint}>
                At least 8 characters with uppercase, lowercase, and a number
              </p>
            </div>

            <div className={styles.field}>
              <label
                htmlFor="confirmPassword"
                className={styles.label}
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                aria-label="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles["submit-button"]}
              aria-busy={loading}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
