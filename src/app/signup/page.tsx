"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-peat-50 to-peat-100 dark:from-peat-950 dark:to-peat-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-display text-3xl text-peat-900 dark:text-peat-50">
              The Messages
            </h1>
          </Link>
          <p className="text-peat-600 dark:text-peat-300 mt-2">Create your account</p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-brine-100 dark:bg-brine-900 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-brine-600 dark:text-brine-400"
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
              <h2 className="text-lg font-medium text-peat-900 dark:text-peat-50 mb-2">
                Check your email
              </h2>
              <p className="text-peat-600 dark:text-peat-300 text-sm mb-4">{success}</p>
              <Link href="/login" className="btn-secondary">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input"
                  placeholder="••••••••"
                />
                <p className="text-xs text-peat-500 dark:text-peat-400 mt-1">
                  At least 8 characters with uppercase, lowercase, and a number
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
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
            <p className="mt-6 text-center text-sm text-peat-600 dark:text-peat-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-brine-600 hover:text-brine-700 dark:text-brine-400 dark:hover:text-brine-300"
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
