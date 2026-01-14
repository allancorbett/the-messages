"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    // Check if URL hash contains recovery tokens
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      // Redirect to reset-password page with the hash preserved
      router.replace(`/reset-password${hash}`);
    }
  }, [router]);

  return null;
}
