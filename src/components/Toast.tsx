"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  show: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, show, onHide, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out",
        show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      <div className="px-4 py-3 rounded-lg bg-peat-900 text-white shadow-lg flex items-center gap-2 min-w-[280px]">
        <svg
          className="w-5 h-5 text-brine-400 flex-shrink-0"
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
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
