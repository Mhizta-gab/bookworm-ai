import { ArrowRight, AudioLines, Bookmark, BookOpen, Highlighter, UploadCloud } from "lucide-react";
import Link from "next/link";
import { BookLibraryCard } from "@/components/dashboard/BookLibraryCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import styles from "@/components/dashboard/dashboard.module.css";
import { dashboardBooks, transcriptPreview } from "@/components/dashboard/mock-data";

export default function HomePage() {
  const currentBook = dashboardBooks[0];
  const recentBooks = dashboardBooks.slice(1, 4);

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
            <span className={styles.tinyPill}>{currentBook.minutes}m listened</span>
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
