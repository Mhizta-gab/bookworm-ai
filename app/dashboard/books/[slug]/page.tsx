import { AudioLines, Bookmark, Highlighter, MessageSquare, PlayCircle, Quote, TimerReset } from "lucide-react";
import Link from "next/link";
import { BookChatPanel } from "@/components/dashboard/BookChatPanel";
import VapiControls from "@/components/VapiControls";
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

      {isDemoBook ? (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Preview book</p>
              <h2 className={styles.panelTitle}>This is a demo workspace</h2>
            </div>
            <Link href="/dashboard/books/new" className={styles.primaryButton}>
              Upload your own book
            </Link>
          </div>
          <p className={styles.bookMeta}>
            Real uploaded books will use this same layout, with their own searchable segments and session history.
          </p>
        </section>
      ) : null}

      <section className={styles.twoCol}>
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

        <article className={styles.panel} id="voice-workspace">
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Session controls</p>
              <h3 className={styles.panelTitle}>Voice workspace</h3>
            </div>
            <span className={styles.statusPill}>
              <AudioLines size={15} />
              {book.status === "Ready" ? "Ready" : "Preparing"}
            </span>
          </div>
          {realBook ? (
            <VapiControls bookId={realBook._id} bookTitle={realBook.title} author={realBook.author} voiceId={realBook.persona} />
          ) : (
            <div className={styles.stack}>
              <div className={styles.statRow}>
                <div className={styles.smallIconWrap}>
                  <MessageSquare size={15} />
                </div>
                <div>
                  <strong>Suggested first prompt</strong>
                  <p className={styles.bookMeta}>{book.lastPrompt}</p>
                </div>
              </div>
              <div className={styles.statRow}>
                <div className={styles.smallIconWrap}>
                  <Highlighter size={15} />
                </div>
                <div>
                  <strong>{book.isUploaded ? "Indexed passages" : "Highlights saved"}</strong>
                  <p className={styles.bookMeta}>
                    {book.isUploaded
                      ? `${book.totalSegments?.toLocaleString() ?? 0} chunks available for grounded retrieval`
                      : `${book.highlights} key moments clipped from this title`}
                  </p>
                </div>
              </div>
              <div className={styles.statRow}>
                <div className={styles.smallIconWrap}>
                  <TimerReset size={15} />
                </div>
                <div>
                  <strong>{book.isUploaded ? "Storage mode" : "Session loop"}</strong>
                  <p className={styles.bookMeta}>
                    {book.isUploaded
                      ? book.fileUrl
                        ? "Cover and PDF are in Cloudinary; metadata and text are in MongoDB."
                        : "Cover is in Cloudinary; metadata and text are in MongoDB."
                      : "Listen, ask, save, and revisit without losing the earlier thread."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className={styles.twoCol}>
        {realBook ? (
          <BookChatPanel bookId={realBook._id} bookTitle={realBook.title} starterPrompt={book.lastPrompt} />
        ) : (
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
        )}

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
