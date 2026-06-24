import { Bookmark, PlayCircle } from "lucide-react";
import Link from "next/link";
import { ReadingWorkspace } from "@/components/dashboard/ReadingWorkspace";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CommentsSection } from "@/components/CommentsSection";
import { toDashboardBook } from "@/components/dashboard/book-view-model";
import styles from "@/components/dashboard/dashboard.module.css";
import { getBookBySlug as getMockBookBySlug } from "@/components/dashboard/mock-data";
import { getBookBySlug } from "@/lib/actions/book.actions";
import { getComments } from "@/lib/actions/comment.actions";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookPageProps) {
  const { slug } = await params;
  const book = await getBookBySlug(slug).catch(() => null);
  return {
    title: book ? `${book.title} — Bookworm AI` : "Book — Bookworm AI",
    description: book ? `Talk with "${book.title}" by ${book.author} on Bookworm AI.` : "",
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;

  const [realBook, initialComments] = await Promise.all([
    getBookBySlug(slug).catch((error) => {
      console.error("Failed to load book:", error);
      return null;
    }),
    getBookBySlug(slug)
      .then((b) => (b ? getComments(String(b._id)) : []))
      .catch(() => []),
  ]);

  const book = realBook ? toDashboardBook(realBook) : getMockBookBySlug(slug);
  const isDemoBook = !realBook;

  return (
    <>
      <PageHeader
        eyebrow="Book detail"
        title={book.title}
        description={`${book.author} · ${book.persona} voice. Ask questions naturally, hear grounded answers, and keep the best moments in your notes.`}
        actions={
          <>
            <button type="button" className={styles.secondaryButton}>
              <Bookmark size={16} />
              Save note
            </button>
            <Link href="#reading-studio" className={styles.primaryButton}>
              <PlayCircle size={16} />
              Start listening
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
                <strong>
                  {book.totalSegments?.toLocaleString() ?? book.sessions}{" "}
                  {book.isUploaded ? "passages ready" : "conversations"}
                </strong>
                <p className={styles.bookMeta}>
                  {book.isUploaded
                    ? book.fileUrl
                      ? "Original PDF saved with this book"
                      : "Readable passages are ready for questions"
                    : `${book.minutes} minutes spoken with this book`}
                </p>
              </div>
              <span className={styles.accentPill}>{book.progress}% complete</span>
            </div>
          </article>
        }
      />

      {/* ── Discussion ──────────────────────────────────────────────────────── */}
      <section className={styles.twoCol}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Discussion</p>
              <h3 className={styles.panelTitle}>Reader comments</h3>
            </div>
            <span className={styles.tinyPill}>
              {initialComments.length} {initialComments.length === 1 ? "comment" : "comments"}
            </span>
          </div>
          <CommentsSection
            bookId={realBook?._id ?? ""}
            initialComments={initialComments}
          />
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>AI powered</p>
              <h3 className={styles.panelTitle}>Read next</h3>
            </div>
          </div>
          <p className={styles.bookMeta}>
            Start a voice session and Bookworm AI will recommend your next three books based on exactly what you talked about — automatically when the session ends.
          </p>
        </article>
      </section>
    </>
  );
}


