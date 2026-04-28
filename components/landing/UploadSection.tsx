import { ArrowRight, Layers3, MessageCircle, NotepadText, Sparkles } from "lucide-react";
import styles from "@/app/page.module.css";
import { SectionHeader } from "./shared";

export function UploadSection() {
  return (
    <section className={styles.section} id="manifesto">
      <div className={styles.container}>
        <SectionHeader
          title="Upload"
          copy="Bring your reading into one place. Bookworm AI gives every document a voice, so your books, notes, and questions live in the same flow."
        />

        <div className={styles.featureGrid}>
          <article className={`${styles.card} ${styles.cardPeriwinkle}`}>
            <div className={styles.cardCopy}>
              <h3>Upload in seconds</h3>
              <p>
                Drop in a PDF and Bookworm AI prepares it for voice conversation, summaries, and follow-up questions
                without extra setup.
              </p>
            </div>
            <div className={styles.captureMock}>
              <div className={styles.captureTop}>
                <span>Deep Work.pdf</span>
                <ArrowRight size={14} />
              </div>
              {[0, 1, 2].map((item) => (
                <div key={item} className={styles.captureRow}>
                  <span className={styles.captureBox} />
                  <span className={styles.captureLine} />
                  <span className={styles.captureIcons}>
                    <span />
                    <span />
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className={`${styles.card} ${styles.cardWhite}`}>
            <div className={styles.cardCopy}>
              <h3>Context that stays attached</h3>
              <p>
                Questions, highlights, and summaries stay tied to the book they came from, so you always know what
                idea belongs to what source.
              </p>
            </div>
            <div className={styles.integrationGraph}>
              <div className={styles.integrationHub}>
                <Layers3 size={22} />
              </div>
              <div className={styles.integrationNode} style={{ top: "8%", left: "58%" }}>
                <NotepadText size={18} />
              </div>
              <div className={styles.integrationNode} style={{ top: "48%", left: "18%" }}>
                <MessageCircle size={18} />
              </div>
              <div className={styles.integrationNode} style={{ top: "70%", left: "66%" }}>
                <Sparkles size={18} />
              </div>
              <div className={styles.integrationLineA} />
              <div className={styles.integrationLineB} />
              <div className={styles.integrationLineC} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
