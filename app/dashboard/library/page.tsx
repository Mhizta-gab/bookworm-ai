import { BookOpen } from "lucide-react";
import Link from "next/link";
import { BookLibraryCard } from "@/components/dashboard/BookLibraryCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import styles from "@/components/dashboard/dashboard.module.css";
import { dashboardBooks } from "@/components/dashboard/mock-data";

export default function LibraryPage() {
  return (
    <>
      <section className={styles.libraryHero}>
        <PageHeader
          eyebrow="Library"
          title="A shared view of every book"
          description="Each card stays lean and live. When a book changes, the library reflects that state, and clicking the card opens the full interface for that book."
          actions={
            <Link href="/dashboard/books/new" className={styles.primaryButton}>
              <BookOpen size={16} />
              Upload a book
            </Link>
          }
        />
      </section>

      <section className={styles.libraryCardGrid}>
        {dashboardBooks.map((book) => (
          <BookLibraryCard key={book.id} book={book} />
        ))}
      </section>
    </>
  );
}
