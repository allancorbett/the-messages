"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/plan", label: "Plan" },
    { href: "/saved", label: "Saved" },
    { href: "/favourites", label: "Favourites" },
    { href: "/shopping-list", label: "Shopping List" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-peat-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/plan" className="font-display text-xl text-peat-900">
            The Messages
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-brine-100 text-brine-700"
                    : "text-peat-600 hover:bg-peat-100 hover:text-peat-900"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="hidden sm:block text-sm text-peat-500 truncate max-w-[150px]">
              {userEmail}
            </span>
          )}
          <form action={signOut}>
            <button type="submit" className="btn-ghost text-sm">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="sm:hidden flex items-center justify-around border-t border-peat-100 px-2 py-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-brine-100 text-brine-700"
                : "text-peat-600"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
