import { MessageCircle } from "lucide-react";
import styles from "@/app/page.module.css";

export function FinalCtaSection() {
  return (
    <section className={styles.finalSection} id="cta">
      <div className={styles.container}>
        <div className={styles.finalCard}>
          <div className={styles.finalCopy}>
            <h2>
              It&apos;s time to make
              <br />
              reading interactive
            </h2>
            <p>Bookworm AI stays with you wherever you read, so your next insight is always one question away.</p>
            <a href="#pricing" className={styles.ctaButton}>
              Try Bookworm
            </a>
          </div>
          <div className={styles.phoneWrap}>
            <div className={styles.phone}>
              <div className={styles.phoneTop} />
              <div className={styles.phoneScreen}>
                <div className={styles.phoneWidget} />
                <div className={styles.phoneStack}>
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.phoneApps}>
                  <div className={styles.appSquare} />
                  <div className={styles.appSquare} />
                  <div className={styles.appSquare} />
                  <div className={styles.appSquare} />
                </div>
                <div className={styles.phoneBubble}>
                  <MessageCircle size={14} />
                  <span>Add a new task</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
