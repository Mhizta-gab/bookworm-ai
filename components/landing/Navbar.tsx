import styles from "@/app/page.module.css";
import { Brand } from "./shared";

export function LandingNavbar() {
  return (
    <div className={styles.navbarWrap}>
      <nav className={styles.navbar}>
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
      </nav>
    </div>
  );
}
