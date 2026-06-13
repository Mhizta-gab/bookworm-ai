import { ArrowRight, AudioLines, Bookmark, BookOpen, Highlighter, UploadCloud } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { BookLibraryCard } from "@/components/dashboard/BookLibraryCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { toDashboardBooks } from "@/components/dashboard/book-view-model";
import styles from "@/components/dashboard/dashboard.module.css";
import { dashboardBooks, transcriptPreview } from "@/components/dashboard/mock-data";
import { getAllBooks } from "@/lib/actions/book.actions";

export default async function HomePage() {
  const { userId } = await auth();
  const realBooks = userId
    ? await getAllBooks().catch((error) => {
        console.error("Failed to load dashboard books:", error);
        return [];
      })
    : [];
  const books = realBooks.length ? toDashboardBooks(realBooks) : dashboardBooks;
  const currentBook = books[0];
  const recentBooks = books.slice(1, 4);
  const isDemoState = !realBooks.length;

  return (
    <>
      <PageHeader
        eyebrow="Current"
        title="Your reading desk"
        description="Pick up where you left off, revisit what the book already taught you, and keep the next title within reach."
        actions={
          <Link href="/dashboard/books/new" className={styles.primaryButton}>
            <UploadCloud size={16} />
            Upload book
          </Link>
        }
      />

      {isDemoState ? (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>{userId ? "Empty library" : "Preview mode"}</p>
              <h2 className={styles.panelTitle}>
                {userId ? "Upload your first book to start reading with Bookworm" : "Sign in to make this reading desk yours"}
              </h2>
            </div>
            <Link href={userId ? "/dashboard/books/new" : "/dashboard/library"} className={styles.primaryButton}>
              {userId ? "Upload book" : "Explore preview"}
              <ArrowRight size={16} />
            </Link>
          </div>
          <p className={styles.bookMeta}>
            The cards below show how Bookworm keeps your books, conversations, and saved insights together. Your own
            uploads will appear here as soon as you add them.
          </p>
        </section>
      ) : null}

      <section className={styles.readingDeskGrid}>
        <article className={styles.currentBookCard}>
          <div className={styles.surfaceHeader}>
            <div>
              <p className={styles.panelLabel}>Now reading</p>
              <h2 className={styles.pageHeaderTitle}>{currentBook.title}</h2>
            </div>
            <span className={styles.accentPill}>{currentBook.progress}% complete</span>
          </div>

          <p className={styles.resumeText}>
            {currentBook.updateSummary} Open the book to continue the same conversation, revisit chapter-level answers,
            or save another key insight.
          </p>

          <div className={styles.resumeMeta}>
            <span className={styles.tinyPill}>{currentBook.author}</span>
            <span className={styles.tinyPill}>{currentBook.genre}</span>
            <span className={styles.tinyPill}>{currentBook.minutes} min listened</span>
          </div>

          <div className={styles.currentBookActions}>
            <Link href={`/dashboard/books/${currentBook.slug}`} className={styles.primaryButton}>
              Open book
              <ArrowRight size={16} />
            </Link>
            <button type="button" className={styles.secondaryButton}>
              <AudioLines size={16} />
              Resume voice
            </button>
          </div>
        </article>

        <article className={styles.memoryCard}>
          <div className={styles.surfaceHeader}>
            <div>
              <p className={styles.panelLabel}>Recent memory</p>
              <h2 className={styles.surfaceTitle}>Last exchange</h2>
            </div>
          </div>

          <div className={styles.memoryList}>
            {transcriptPreview.slice(0, 2).map((row, index) => (
              <div key={`${row.role}-${index}`} className={styles.memoryRow}>
                <span className={styles.memoryRole}>{row.role}</span>
                <p className={styles.memoryText}>{row.text}</p>
              </div>
            ))}
          </div>

          <div className={styles.memoryActions}>
            <button type="button" className={styles.ghostButton}>
              <Bookmark size={15} />
              Save note
            </button>
            <button type="button" className={styles.ghostButton}>
              <Highlighter size={15} />
              Highlight
            </button>
          </div>
        </article>
      </section>

      <section className={styles.shelfSection}>
        <div className={styles.surfaceHeader}>
          <div>
            <p className={styles.panelLabel}>Shelf</p>
            <h2 className={styles.surfaceTitle}>Recent books</h2>
          </div>
          <Link href="/dashboard/library" className={styles.ghostButton}>
            <BookOpen size={15} />
            Open library
          </Link>
        </div>

        <div className={styles.compactShelfGrid}>
          {recentBooks.map((book) => (
            <BookLibraryCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </>
  );
}
