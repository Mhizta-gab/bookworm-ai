import { BookOpen, Search } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { BookLibraryCard } from "@/components/dashboard/BookLibraryCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { toDashboardBooks } from "@/components/dashboard/book-view-model";
import styles from "@/components/dashboard/dashboard.module.css";
import { dashboardBooks } from "@/components/dashboard/mock-data";
import { getAllBooks } from "@/lib/actions/book.actions";

interface LibraryPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { userId } = await auth();
  const { query } = await searchParams;
  const realBooks = userId
    ? await getAllBooks({ query }).catch((error) => {
        console.error("Failed to load library books:", error);
        return [];
      })
    : [];
  const books = realBooks.length ? toDashboardBooks(realBooks) : dashboardBooks;
  const isDemoState = !realBooks.length;

  return (
    <>
      <section className={styles.libraryHero}>
        <PageHeader
          eyebrow="Library"
          title="Every book stays ready to talk"
          description="Search your saved titles, pick up recent conversations, and keep notes and highlights close while you read."
          actions={
            <Link href="/dashboard/books/new" className={styles.primaryButton}>
              <BookOpen size={16} />
              Upload a book
            </Link>
          }
        />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <form className={styles.search} action="/dashboard/library">
            <Search size={16} />
            <input
              className={styles.searchInput}
              name="query"
              placeholder="Search title or author"
              defaultValue={query ?? ""}
            />
          </form>
          <span className={styles.statusPill}>{realBooks.length || books.length} books</span>
        </div>
        {isDemoState ? (
          <p className={styles.bookMeta}>
            {userId
              ? "Your library is empty right now. The preview cards show what your reading shelf will feel like after your first upload."
              : "You are viewing preview books. Sign in and upload a PDF to create your own library."}
          </p>
        ) : null}
      </section>

      {books.length ? (
        <section className={styles.libraryCardGrid}>
          {books.map((book) => (
            <BookLibraryCard key={book.id} book={book} />
          ))}
        </section>
      ) : (
        <section className={styles.panel}>
          <p className={styles.bookMeta}>No books matched that search.</p>
        </section>
      )}
    </>
  );
}
