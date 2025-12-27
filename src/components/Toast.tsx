"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import styles from "./Toast.module.css";

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
        styles["toast-container"],
        show ? styles.visible : styles.hidden
      )}
    >
      <div className={styles.toast}>
        <svg
          className={styles.icon}
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
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  );
}
