"use client";

import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {
  Bell,
  BookOpen,
  ChartColumnIncreasing,
  CreditCard,
  Library,
  User,
  Search,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";
import type { PlanType } from "@/lib/subscription-constants";

const navItems = [
  { href: "/dashboard", label: "Desk", icon: ChartColumnIncreasing },
  { href: "/dashboard/library", label: "Library", icon: Library },
  { href: "/dashboard/books/new", label: "Add", icon: Plus },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export function DashboardShell({
  children,
  isSignedIn,
  plan = "free",
}: {
  children: React.ReactNode;
  isSignedIn: boolean;
  plan?: PlanType;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const planBadgeClass = `planBadge${planLabel}` as keyof typeof styles;

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
                <Link 
                  href={`/dashboard/profile/${user?.username || user?.id || ""}`} 
                  className={styles.iconButton} 
                  aria-label="Profile"
                >
                  <User size={16} />
                </Link>
                <Link href="/dashboard/books/new" className={styles.primaryButton}>
                  <Plus size={16} />
                  Add book
                </Link>
                <Link
                  href="/dashboard/billing"
                  className={`${styles.planBadge} ${styles[planBadgeClass]}`}
                  aria-label={`Current plan: ${planLabel}`}
                >
                  <CreditCard size={12} />
                  {planLabel}
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
