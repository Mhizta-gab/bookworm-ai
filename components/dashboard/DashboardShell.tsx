"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  Bell,
  BookOpen,
  ChartColumnIncreasing,
  Library,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./dashboard.module.css";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: ChartColumnIncreasing },
  { href: "/dashboard/library", label: "Library", icon: Library },
  { href: "/dashboard/books/new", label: "Upload", icon: Plus },
];

export function DashboardShell({
  children,
  isSignedIn,
}: {
  children: React.ReactNode;
  isSignedIn: boolean;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={styles.shell}>
      <div className={`${styles.layout} ${isSidebarCollapsed ? styles.layoutCollapsed : ""}`}>
        <aside className={styles.sidebar}>
          <div className={`${styles.sidebarInner} ${isSidebarCollapsed ? styles.sidebarInnerCollapsed : ""}`}>
            <div className={styles.sidebarTopRow}>
              <Link
                href="/dashboard"
                className={`${styles.brand} ${isSidebarCollapsed ? styles.brandCollapsed : ""}`}
              >
                <span className={styles.brandMark}>
                  <BookOpen size={18} strokeWidth={2.1} />
                </span>
                <span className={styles.brandTextBlock}>
                  <span className={styles.brandTitle}>bookworm ai</span>
                  <p className={styles.brandSubtitle}>Voice-first reading workspace</p>
                </span>
              </Link>

              <button
                type="button"
                className={styles.sidebarToggle}
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-pressed={isSidebarCollapsed}
                onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
              >
                {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>

            <nav className={styles.navGroup}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} strokeWidth={2.1} />
                    <span className={`${styles.navItemLabel} ${isSidebarCollapsed ? styles.navItemLabelHidden : ""}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className={`${styles.sidebarCard} ${isSidebarCollapsed ? styles.sidebarCardCollapsed : ""}`}>
              <h3>Reading loop</h3>
              <p>Upload once, talk through difficult passages, save the ideas that matter, and return later with context.</p>
              <Link href="/dashboard/books/new" className={styles.sidebarButton}>
                <Plus size={16} />
                <span className={styles.sidebarButtonLabel}>Add a book</span>
              </Link>
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
                    {isSignedIn ? "Your library, memory, and live sessions" : "Sign in to keep your reading state"}
                  </p>
                </div>
              </div>

              <div className={styles.topbarActions}>
                <div className={styles.search}>
                  <Search size={16} />
                  <span>Search books, highlights, sessions</span>
                </div>
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
                    Create
                  </Link>
                  <div className={styles.dashboardUserButton}>
                    <UserButton />
                  </div>
                </Show>
              </div>
            </div>

            <div className={styles.page}>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
