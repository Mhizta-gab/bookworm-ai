"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  Bell,
  BookOpen,
  ChartColumnIncreasing,
  Library,
  MessageSquare,
  Search,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";

const navItems = [
  { href: "/dashboard", label: "Desk", icon: ChartColumnIncreasing },
  { href: "/dashboard/library", label: "Library", icon: Library },
  { href: "/dashboard/books/new", label: "Add", icon: Plus },
];

export function DashboardShell({
  children,
  isSignedIn,
}: {
  children: React.ReactNode;
  isSignedIn: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarTopRow}>
              <Link href="/dashboard" className={styles.brand}>
                <span className={styles.brandMark}>
                  <BookOpen size={18} strokeWidth={2.1} />
                </span>
                <span className={styles.brandTextBlock}>
                  <span className={styles.brandTitle}>bookworm ai</span>
                  <p className={styles.brandSubtitle}>Your reading desk</p>
                </span>
              </Link>
            </div>

            <nav className={styles.navGroup}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                  >
                    <Icon size={18} strokeWidth={2.1} />
                    <span className={styles.navItemLabel}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className={styles.navActions}>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button type="button" className={styles.secondaryButton}>
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button type="button" className={styles.primaryButton}>
                    Create account
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <button type="button" className={styles.iconButton} aria-label="Notifications">
                  <Bell size={16} />
                </button>
                <button type="button" className={styles.iconButton} aria-label="Messages">
                  <MessageSquare size={16} />
                </button>
                <Link href="/dashboard/books/new" className={styles.primaryButton}>
                  <Plus size={16} />
                  Add book
                </Link>
                <div className={styles.dashboardUserButton}>
                  <UserButton />
                </div>
              </Show>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.mainInner}>
            <div className={styles.topbar}>
              <div className={styles.topbarMeta}>
                <div>
                  <p className={styles.topbarLabel}>Reading studio</p>
                  <p className={styles.topbarTitle}>
                    {isSignedIn ? "Your books, notes, and reading conversations" : "Sign in to keep your books close"}
                  </p>
                </div>
              </div>

              <div className={styles.topbarActions}>
                <div className={styles.search}>
                  <Search size={16} />
                  <span>Search books, notes, and highlights</span>
                </div>
              </div>
            </div>

            <div className={styles.page}>{children}</div>
          </div>
        </main>

        <nav className={styles.mobileNav} aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ""}`}
              >
                <Icon size={19} strokeWidth={2.2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
