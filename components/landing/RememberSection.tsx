import { BadgeCheck, Mail, MessageCircle } from "lucide-react";
import styles from "@/app/page.module.css";
import { SectionHeader } from "./shared";

export function RememberSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeader
          title="Remember"
          copy="Keep the useful parts of every session. Bookworm AI helps you retain what matters with saved insights, highlights, and revisitable voice sessions."
        />

        <div className={styles.featureGrid}>
          <article className={`${styles.card} ${styles.cardCoral}`}>
            <div className={styles.cardCopy}>
              <h3>Turn reading into action</h3>
              <p>
                Ask for summaries, key arguments, counterpoints, and next steps. Bookworm AI helps you leave each
                session with something usable.
              </p>
            </div>
            <div className={styles.syncStack}>
              <div className={styles.syncCardTop}>
                <div className={styles.syncApp}>
                  <MessageCircle size={16} />
                </div>
                <div>
                  <strong>Bookworm AI</strong>
                  <p>Explain the author&apos;s main point here like I&apos;m revising for an exam.</p>
                </div>
              </div>
              {["Chapter recap", "Key quote", "Audio answer", "Save to notes"].map((item, index) => (
                <div key={item} className={styles.syncRow}>
                  <span className={styles.syncIcon}>{index === 0 ? <Mail size={12} /> : <BadgeCheck size={12} />}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>

          <article className={`${styles.card} ${styles.cardWhite}`}>
            <div className={styles.cardCopy}>
              <h3>Build your reading habit</h3>
              <p>
                Pick up where you left off, revisit earlier books, and keep momentum across short sessions on your
                phone or laptop.
              </p>
            </div>
            <div className={styles.peopleCluster}>
              <div className={styles.personA} />
              <div className={styles.personB} />
              <div className={styles.personC} />
              <div className={styles.personD} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
