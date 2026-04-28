"use client";

import { Menu, X } from "lucide-react";
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
        <a href="#cta" className={styles.ctaButton}>
          Try Bookworm
        </a>

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
          <a href="#cta" className={styles.mobileMenuCta} onClick={() => setIsOpen(false)}>
            Try Bookworm
          </a>
        </div>
      </nav>
    </div>
  );
}
