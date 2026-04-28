import { ArrowRight, Circle } from "lucide-react";
import styles from "@/app/page.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>
              Turn any <span>book</span>
              <br />
              into a conversation
            </h1>
            <p className={styles.heroText}>
              Upload a PDF, ask questions out loud, and hear thoughtful answers back. Bookworm AI helps you read,
              revise, and remember without getting buried in pages.
            </p>
            <a href="#cta" className={styles.ctaButton}>
              Try Bookworm
            </a>
          </div>

          <div className={styles.heroArtwork}>
            <div className={styles.miniPanel}>
              <div className={styles.miniPanelHeader}>
                <span>Summarize chapter 4</span>
                <ArrowRight size={14} />
              </div>
              <div className={styles.miniTags}>
                <span>Atomic Habits</span>
                <span>Behavior change</span>
                <span>2 min answer</span>
                <span>Today</span>
              </div>
            </div>

            <div className={styles.mainPanel}>
              <div className={styles.mainPanelHeader}>
                <div>
                  <strong>Book chat</strong>
                  <div className={styles.mainPanelMeta}>Uploaded PDF • Voice mode • Notes • Highlights</div>
                </div>
                <span className={styles.plusBadge}>+</span>
              </div>

              <div className={styles.sharedBadge}>Chapter 4</div>
              <div className={styles.priorityFlag}>Key insight</div>

              {[0, 1, 2, 3].map((item) => (
                <div key={item} className={styles.taskLine}>
                  <Circle size={14} strokeWidth={1.7} />
                  <div className={styles.taskBar} />
                  <div className={styles.taskTag} />
                  <div className={styles.taskAvatars}>
                    <span />
                    <span />
                  </div>
                </div>
              ))}

              <div className={styles.ownerBadge}>Listen</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
