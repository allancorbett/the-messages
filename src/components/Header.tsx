"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import styles from "./Header.module.css";

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/plan", label: "Plan" },
    { href: "/saved", label: "Saved" },
    { href: "/shopping-list", label: "Shopping List" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles["left-section"]}>
          <Link href="/plan" className={styles.logo}>
            The Messages
          </Link>

          <nav className={styles["desktop-nav"]}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  styles["nav-link"],
                  pathname === link.href && styles.active
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles["right-section"]}>
          {userEmail && (
            <span className={styles["user-email"]}>
              {userEmail}
            </span>
          )}
          <form action={signOut}>
            <button type="submit" className={styles["sign-out-button"]}>
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className={styles["mobile-nav"]}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              styles["mobile-link"],
              pathname === link.href && styles.active
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
