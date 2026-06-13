import { AudioLines, Bookmark, Highlighter, MessageSquare, PlayCircle, Quote, TimerReset } from "lucide-react";
import Link from "next/link";
import { ReadingWorkspace } from "@/components/dashboard/ReadingWorkspace";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { toDashboardBook } from "@/components/dashboard/book-view-model";
import styles from "@/components/dashboard/dashboard.module.css";
import { getBookBySlug as getMockBookBySlug, recommendations, transcriptPreview } from "@/components/dashboard/mock-data";
import { getBookBySlug } from "@/lib/actions/book.actions";

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
  const realBook = await getBookBySlug(slug).catch((error) => {
    console.error("Failed to load book workspace:", error);
    return null;
  });
  const book = realBook ? toDashboardBook(realBook) : getMockBookBySlug(slug);
  const isDemoBook = !realBook;

  return (
    <>
      <PageHeader
        eyebrow="Book detail"
        title={book.title}
        description={`${book.author} - ${book.genre} - Voice persona ${book.persona}. Ask questions naturally, get grounded answers, and keep the best moments in your notes.`}
        actions={
          <>
            <button type="button" className={styles.secondaryButton}>
              <Bookmark size={16} />
              Save note
            </button>
            <Link href="#voice-workspace" className={styles.primaryButton}>
              <PlayCircle size={16} />
              Voice workspace
            </Link>
          </>
        }
      />

      <ReadingWorkspace
        bookId={realBook?._id ?? ""}
        bookTitle={book.title}
        author={book.author}
        starterPrompt={book.lastPrompt}
        voiceId={book.persona}
        isDemoBook={isDemoBook}
        bookCardNode={
          <article className={styles.bookCard}>
            <div className={styles.bookCover} style={{ background: book.accent }}>
              {book.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.coverUrl} alt="" className={styles.bookCoverImage} />
              ) : (
                <>
                  <div className={styles.bookCoverTop}>
                    <span className={styles.accentPill}>{book.status}</span>
                    <span className={styles.tinyPill}>{book.persona}</span>
                  </div>
                  <div>
                    <p className={styles.panelLabel}>{book.genre}</p>
                    <h2 className={styles.bookTitle}>{book.title}</h2>
                    <p className={styles.bookMeta}>{book.author}</p>
                  </div>
                </>
              )}
            </div>
            <p className={styles.bookMeta}>{book.summary}</p>
            <div className={styles.bookCardFooter}>
              <div>
                <strong>{book.totalSegments?.toLocaleString() ?? book.sessions} {book.isUploaded ? "segments" : "sessions"}</strong>
                <p className={styles.bookMeta}>
                  {book.isUploaded
                    ? book.fileUrl
                      ? "Original PDF retained in Cloudinary"
                      : "Original PDF not retained; searchable text is stored"
                    : `${book.minutes} minutes spoken with this book`}
                </p>
              </div>
              <span className={styles.accentPill}>{book.progress}% complete</span>
            </div>
          </article>
        }
      />

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
                  <p className={styles.bookMeta}>Suggested from this session&apos;s themes</p>
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
