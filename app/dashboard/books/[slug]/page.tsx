import { AudioLines, Bookmark, Highlighter, MessageSquare, PlayCircle, Quote, TimerReset } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import styles from "@/components/dashboard/dashboard.module.css";
import { getBookBySlug, recommendations, transcriptPreview } from "@/components/dashboard/mock-data";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

const comments = [
  {
    name: "Mina",
    role: "Book club host",
    text: "The voice recap for chapter four was unusually strong. It helped us align the whole discussion before the call.",
  },
  {
    name: "Sam",
    role: "Student",
    text: "I use the transcript to pull revision prompts, then save the best ones as highlights for later.",
  },
];

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  return (
    <>
      <PageHeader
        eyebrow="Book detail"
        title={book.title}
        description={`${book.author} • ${book.genre} • Voice persona ${book.persona}. Ask questions naturally, get grounded answers, and keep the best moments in your notes.`}
        actions={
          <>
            <button type="button" className={styles.secondaryButton}>
              <Bookmark size={16} />
              Save note
            </button>
            <button type="button" className={styles.primaryButton}>
              <PlayCircle size={16} />
              Start voice session
            </button>
          </>
        }
      />

      <section className={styles.twoCol}>
        <article className={styles.bookCard}>
          <div className={styles.bookCover} style={{ background: book.accent }}>
            <div className={styles.bookCoverTop}>
              <span className={styles.accentPill}>{book.status}</span>
              <span className={styles.tinyPill}>{book.persona}</span>
            </div>
            <div>
              <p className={styles.panelLabel}>{book.genre}</p>
              <h2 className={styles.bookTitle}>{book.title}</h2>
              <p className={styles.bookMeta}>{book.author}</p>
            </div>
          </div>
          <p className={styles.bookMeta}>{book.summary}</p>
          <div className={styles.bookCardFooter}>
            <div>
              <strong>{book.sessions} sessions</strong>
              <p className={styles.bookMeta}>{book.minutes} minutes spoken with this book</p>
            </div>
            <span className={styles.accentPill}>{book.progress}% complete</span>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Session controls</p>
              <h3 className={styles.panelTitle}>Voice workspace</h3>
            </div>
            <span className={styles.statusPill}>
              <AudioLines size={15} />
              Ready
            </span>
          </div>
          <div className={styles.stack}>
            <div className={styles.statRow}>
              <div className={styles.smallIconWrap}>
                <MessageSquare size={15} />
              </div>
              <div>
                <strong>Last prompt</strong>
                <p className={styles.bookMeta}>{book.lastPrompt}</p>
              </div>
            </div>
            <div className={styles.statRow}>
              <div className={styles.smallIconWrap}>
                <Highlighter size={15} />
              </div>
              <div>
                <strong>Highlights saved</strong>
                <p className={styles.bookMeta}>{book.highlights} key moments clipped from this title</p>
              </div>
            </div>
            <div className={styles.statRow}>
              <div className={styles.smallIconWrap}>
                <TimerReset size={15} />
              </div>
              <div>
                <strong>Session loop</strong>
                <p className={styles.bookMeta}>Listen, ask, save, and revisit without losing the earlier thread.</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.twoCol}>
        <article className={styles.transcriptCard}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Transcript memory</p>
              <h3 className={styles.panelTitle}>Recent conversation</h3>
            </div>
          </div>
          {transcriptPreview.map((row, index) => (
            <div
              key={`${row.role}-${index}`}
              className={`${styles.transcriptRow} ${row.role === "Bookworm" ? styles.transcriptAssistant : ""}`}
            >
              <div className={styles.transcriptBubble}>
                <div className={styles.transcriptRole}>{row.role}</div>
                <div>{row.text}</div>
              </div>
            </div>
          ))}
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Saved outputs</p>
              <h3 className={styles.panelTitle}>Highlights and notes</h3>
            </div>
          </div>
          <div className={styles.stack}>
            <div className={styles.listRow}>
              <div>
                <strong>Identity before outcomes</strong>
                <p className={styles.bookMeta}>Saved from a chapter four recap</p>
              </div>
              <Quote size={16} />
            </div>
            <div className={styles.listRow}>
              <div>
                <strong>Morning habit starter</strong>
                <p className={styles.bookMeta}>Generated as a practical next-step list</p>
              </div>
              <Quote size={16} />
            </div>
            <div className={styles.commentsComposer}>
              <div className={styles.composerBox}>Ask a follow-up, pin a note, or turn a spoken answer into a reusable summary.</div>
              <div className={styles.buttonRow}>
                <button type="button" className={styles.primaryButton}>
                  Save current answer
                </button>
                <button type="button" className={styles.secondaryButton}>
                  Export transcript
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.twoCol}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Discussion</p>
              <h3 className={styles.panelTitle}>Reader comments</h3>
            </div>
          </div>
          <div className={styles.commentList}>
            {comments.map((comment) => (
              <div key={comment.name} className={styles.commentCard}>
                <div>
                  <strong>{comment.name}</strong>
                  <p className={styles.commentMeta}>{comment.role}</p>
                </div>
                <div>{comment.text}</div>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Suggested next</p>
              <h3 className={styles.panelTitle}>Related books</h3>
            </div>
          </div>
          <div className={styles.stack}>
            {recommendations.map((title) => (
              <div key={title} className={styles.listRow}>
                <div>
                  <strong>{title}</strong>
                  <p className={styles.bookMeta}>Suggested from this session’s themes</p>
                </div>
                <Link href="/dashboard/library" className={styles.ghostButton}>
                  Open
                </Link>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
