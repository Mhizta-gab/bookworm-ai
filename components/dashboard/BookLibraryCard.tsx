import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import type { DashboardBook } from "./mock-data";

interface BookLibraryCardProps {
  book: DashboardBook;
}

export function BookLibraryCard({ book }: BookLibraryCardProps) {
  return (
    <Link href={`/dashboard/books/${book.slug}`} className={styles.libraryCardLink}>
      <article className={styles.libraryCard}>
        <div className={styles.libraryCardTop}>
          <span className={styles.accentPill}>{book.status}</span>
          <span className={styles.libraryCardUpdate}>{book.updatedLabel}</span>
        </div>

        <div className={styles.libraryCardBody}>
          <div className={styles.libraryCardCover} style={{ background: book.accent }}>
            <p className={styles.panelLabel}>{book.genre}</p>
            <h2 className={styles.bookTitle}>{book.title}</h2>
            <p className={styles.bookMeta}>{book.author}</p>
          </div>

          <div className={styles.libraryCardContent}>
            <p className={styles.libraryCardSummary}>{book.updateSummary}</p>

            <div className={styles.libraryCardMeta}>
              <span className={styles.tinyPill}>{book.persona}</span>
              <span className={styles.tinyPill}>{book.progress}% complete</span>
            </div>
          </div>
        </div>

        <div className={styles.libraryCardFooter}>
          <span className={styles.libraryCardHint}>Open book interface</span>
          <span className={styles.libraryCardArrow}>
            <ArrowUpRight size={16} />
          </span>
        </div>
      </article>
    </Link>
  );
}
