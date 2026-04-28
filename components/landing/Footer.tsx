import { Globe, Mail, MessageSquareText, SendHorizontal } from "lucide-react";
import styles from "@/app/page.module.css";
import { Brand } from "./shared";

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.brandFooter}>
            <Brand light />
            <p>Your voice-first reading companion for books, notes, and ideas</p>
          </div>
          <div className={styles.socialRow}>
            <a href="#testimonials" aria-label="Community">
              <MessageSquareText size={16} strokeWidth={2.1} />
            </a>
            <a href="mailto:hello@bookworm.ai" aria-label="Email">
              <Mail size={16} strokeWidth={2.1} />
            </a>
            <a href="#manifesto" aria-label="Website">
              <Globe size={16} strokeWidth={2.1} />
            </a>
            <a href="#cta" aria-label="Share">
              <SendHorizontal size={16} strokeWidth={2.1} />
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>Built for readers who want to think with their books, not just store them.</p>
          <div>
            <a href="#pricing">Legal doc</a>
            <a href="#pricing">Privacy</a>
            <a href="#pricing">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
