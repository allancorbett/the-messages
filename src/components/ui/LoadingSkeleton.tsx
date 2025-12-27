import styles from "./LoadingSkeleton.module.css";

interface LoadingSkeletonProps {
  variant?: "title" | "text-long" | "text-medium" | "text-short" | "custom";
  width?: string;
  height?: string;
  className?: string;
}

export function LoadingSkeleton({
  variant = "text-long",
  width,
  height,
  className,
}: LoadingSkeletonProps) {
  const variantClass = variant !== "custom" ? styles[variant] : "";
  const customStyle: React.CSSProperties = {};

  if (width) customStyle.inlineSize = width;
  if (height) customStyle.blockSize = height;

  return (
    <div
      className={`${styles.skeleton} ${variantClass} ${className || ""}`}
      style={customStyle}
    />
  );
}

interface LoadingContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function LoadingContainer({ children, className }: LoadingContainerProps) {
  return (
    <div className={`${styles.container} ${className || ""}`}>
      {children}
    </div>
  );
}
