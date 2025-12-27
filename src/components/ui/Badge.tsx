import styles from "./Badge.module.css";

interface BadgeProps {
  variant?: "economic" | "mid" | "fancy" | "default";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variantClass = variant !== "default" ? styles[variant] : "";

  return (
    <span className={`${styles.badge} ${variantClass} ${className || ""}`}>
      {children}
    </span>
  );
}
