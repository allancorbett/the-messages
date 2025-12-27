import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles["icon-container"]}>
        {icon}
      </div>
      <h2 className={styles.title}>
        {title}
      </h2>
      <p className={styles.description}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={styles.button}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
