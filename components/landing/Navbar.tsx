"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import styles from "@/app/page.module.css";
import { Brand } from "./shared";

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.navbarWrap}>
      <nav className={`${styles.navbar} ${isOpen ? styles.navbarOpen : ""}`}>
        <Brand />
        <div className={styles.navPill}>Voice-first reading for modern learners</div>
        <div className={styles.navLinks}>
          <a href="#manifesto">How it works</a>
          <a href="#testimonials">Reviews</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className={styles.navAuthActions}>
          <Show when="signed-out">
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button type="button" className={styles.navTextButton}>
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button type="button" className={styles.ctaButton}>
                Try Bookworm
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className={styles.ctaButton}>
              Go to Dashboard
            </Link>
            <div className={styles.authUserButton}>
              <UserButton />
            </div>
          </Show>
        </div>

        <button
          type="button"
          className={styles.mobileMenuButton}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={18} strokeWidth={2.2} /> : <Menu size={18} strokeWidth={2.2} />}
        </button>

        <div className={`${styles.mobileMenuPanel} ${isOpen ? styles.mobileMenuPanelOpen : ""}`}>
          <a href="#manifesto" onClick={() => setIsOpen(false)}>
            How it works
          </a>
          <a href="#testimonials" onClick={() => setIsOpen(false)}>
            Reviews
          </a>
          <a href="#pricing" onClick={() => setIsOpen(false)}>
            Pricing
          </a>
          <Show when="signed-out">
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button type="button" className={styles.mobileMenuPlainButton} onClick={() => setIsOpen(false)}>
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button type="button" className={styles.mobileMenuCta} onClick={() => setIsOpen(false)}>
                Try Bookworm
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className={styles.mobileMenuCta} onClick={() => setIsOpen(false)}>
              Go to Dashboard
            </Link>
            <div className={styles.mobileUserButton}>
              <UserButton />
            </div>
          </Show>
        </div>
      </nav>
    </div>
  );
}
