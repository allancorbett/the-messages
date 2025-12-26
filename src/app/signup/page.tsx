"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp, signInWithOAuth } from "@/app/actions/auth";

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

  async function handleOAuthSignIn(provider: "google" | "apple") {
    setError(null);
    const result = await signInWithOAuth(provider);

    if (result.error) {
      setError(result.error);
    } else if (result.data?.url) {
      window.location.href = result.data.url;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-peat-50 to-peat-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-display text-3xl text-peat-900">
              The Messages
            </h1>
          </Link>
          <p className="text-peat-600 mt-2">Create your account</p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-brine-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-brine-600"
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
              <h2 className="text-lg font-medium text-peat-900 mb-2">
                Check your email
              </h2>
              <p className="text-peat-600 text-sm mb-4">{success}</p>
              <Link href="/login" className="btn-secondary">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Social login buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("google")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-peat-200 hover:border-peat-300 hover:bg-peat-50 transition-colors text-peat-700 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("apple")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-peat-200 hover:border-peat-300 hover:bg-peat-50 transition-colors text-peat-700 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-peat-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-peat-500">Or continue with email</span>
                </div>
              </div>

              <form action={handleSubmit} className="space-y-4">
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
                <p className="text-xs text-peat-500 mt-1">
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
            </>
          )}

          {!success && (
            <p className="mt-6 text-center text-sm text-peat-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-brine-600 hover:text-brine-700"
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
