import { BookOpen, Check, Layers3, Menu } from "lucide-react";
import styles from "@/app/page.module.css";
import { SectionHeader } from "./shared";

export function UnderstandSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeader
          title="Understand"
          copy="Move beyond passive reading. Ask for definitions, examples, summaries, and chapter takeaways exactly when you need them."
        />

        <div className={styles.stack}>
          <article className={`${styles.card} ${styles.cardGold} ${styles.splitCard}`}>
            <div className={styles.cardCopyWide}>
              <span className={styles.labelPill}>Smart prompts</span>
              <h3>Switch from quick answers to deeper explanations without losing your place.</h3>
              <p>Use the mode that matches the moment, whether you are reviewing, studying, or exploring an idea.</p>
              <div className={styles.buttonRow}>
                <button type="button" className={styles.smallButton}>
                  Quick recap
                </button>
                <button type="button" className={styles.smallButton}>
                  Deep dive
                </button>
              </div>
            </div>

            <div className={styles.tasksBoard}>
              <div className={styles.tasksBoardHeader}>
                <strong>Book Session</strong>
                <div className={styles.boardIcons}>
                  <Menu size={14} />
                  <Layers3 size={14} />
                </div>
              </div>
              <div className={styles.boardTags}>
                <span>Summary</span>
                <span>Quotes</span>
                <span>+</span>
              </div>
              <div className={styles.priorityFlagBoard}>Most asked</div>
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className={styles.boardRow}>
                  <span className={styles.boardCheck}>{item === 1 ? <Check size={12} /> : null}</span>
                  <span className={styles.boardText} />
                  <span className={styles.boardPill} />
                  <span className={styles.boardAvatar} />
                </div>
              ))}
            </div>
          </article>

          <article className={`${styles.card} ${styles.cardWhite} ${styles.splitCard}`}>
            <div className={styles.cardCopyWide}>
              <h3>
                Study
                <br />+ Leisure
              </h3>
              <p>
                From textbooks to memoirs, Bookworm AI adapts to how you read. Use it for coursework, research,
                professional learning, or books you just want to enjoy more deeply.
              </p>
            </div>

            <div className={styles.personalGraph}>
              <div className={styles.personalCenter}>
                <BookOpen size={20} />
              </div>
              {["Exam prep", "Research", "Book club", "Work docs", "Weekend reads", "Notes"].map((label, index) => (
                <div key={label} className={styles.personalNode} data-index={index}>
                  {label}
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
