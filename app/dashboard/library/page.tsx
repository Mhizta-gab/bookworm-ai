import { BookOpen, Sparkles, UploadCloud } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BookLibraryCard } from "@/components/dashboard/BookLibraryCard";
import { LibrarySearch } from "@/components/dashboard/LibrarySearch";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { toDashboardBooks } from "@/components/dashboard/book-view-model";
import styles from "@/components/dashboard/dashboard.module.css";
import { dashboardBooks } from "@/components/dashboard/mock-data";
import { getAllBooksPublic, type BookWithStats } from "@/lib/actions/book.actions";

export const metadata = {
  title: "Library — Bookworm AI",
  description: "Browse every book in the Bookworm AI community library. Search, discover, and start a voice conversation.",
};

interface LibraryPageProps {
  searchParams: Promise<{ query?: string; sort?: "newest" | "popular" }>;
}

function toBookWithStats(book: ReturnType<typeof toDashboardBooks>[number]): BookWithStats & { slug: string; accent?: string } {
  return {
    _id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    persona: book.persona,
    coverUrl: book.coverUrl ?? "",
    fileUrl: book.fileUrl,
    fileSize: book.fileSize ?? 0,
    totalSegments: book.totalSegments ?? 0,
    sessionCount: book.sessions ?? 0,
    readerCount: 0,
    clerkId: "",
    createdAt: "",
    updatedAt: "",
    accent: book.accent,
  } as unknown as BookWithStats & { slug: string; accent?: string };
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { query, sort } = await searchParams;

  let realBooks: BookWithStats[] = [];
  let fetchError = false;

  try {
    realBooks = await getAllBooksPublic(query);
  } catch {
    fetchError = true;
  }

  // Sort by popularity if requested
  const sortedBooks =
    sort === "popular"
      ? [...realBooks].sort((a, b) => b.sessionCount - a.sessionCount)
      : realBooks;

  const isDemoState = !realBooks.length && !query;

  // Show mock data only when there are truly no books yet (not just empty search)
  const displayBooks = isDemoState && !fetchError
    ? toDashboardBooks(dashboardBooks as any).map(toBookWithStats)
    : (sortedBooks as (BookWithStats & { slug: string; accent?: string })[]);

  const totalSessions = realBooks.reduce((s, b) => s + b.sessionCount, 0);
  const totalReaders = new Set(realBooks.flatMap(() => [])).size; // approximate

  return (
    <>
      <section className={styles.libraryHero}>
        <PageHeader
          eyebrow="Community Library"
          title="Every book stays ready to talk"
          description="Browse every book in the Bookworm library. Start a voice conversation, ask questions, and discover what others are reading."
          actions={
            <Link href="/dashboard/books/new" className={styles.primaryButton}>
              <UploadCloud size={16} />
              Upload a book
            </Link>
          }
        />

        {realBooks.length > 0 && (
          <div className={styles.heroStrip}>
            <span className={styles.tinyPill}>
              <BookOpen size={12} />
              {realBooks.length} {realBooks.length === 1 ? "book" : "books"}
            </span>
            <span className={styles.tinyPill}>
              <Sparkles size={12} />
              {totalSessions} {totalSessions === 1 ? "conversation" : "conversations"} had
            </span>
          </div>
        )}
      </section>

      {/* ── Search + sort controls ────────────────────────────────────────── */}
      <div className={styles.libraryControls}>
        <Suspense fallback={null}>
          <LibrarySearch defaultValue={query ?? ""} totalCount={sortedBooks.length} />
        </Suspense>

        <div className={styles.librarySort}>
          <Link
            href="/dashboard/library"
            className={`${styles.surfaceFilter} ${!sort || sort === "newest" ? styles.surfaceFilterActive : ""}`}
          >
            Newest
          </Link>
          <Link
            href="/dashboard/library?sort=popular"
            className={`${styles.surfaceFilter} ${sort === "popular" ? styles.surfaceFilterActive : ""}`}
          >
            Most read
          </Link>
        </div>
      </div>

      {/* ── Demo state notice ─────────────────────────────────────────────── */}
      {isDemoState && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Preview mode</p>
              <h2 className={styles.panelTitle}>Your library starts here</h2>
            </div>
            <Link href="/dashboard/books/new" className={styles.primaryButton}>
              <UploadCloud size={16} />
              Upload first book
            </Link>
          </div>
          <p className={styles.bookMeta}>
            The cards below show what your library will look like. Upload a PDF to add your first real book — it will
            appear here immediately and be visible to the whole community.
          </p>
        </section>
      )}

      {/* ── Search empty state ─────────────────────────────────────────────── */}
      {query && sortedBooks.length === 0 && (
        <section className={styles.panel}>
          <p className={styles.panelLabel}>No results</p>
          <h2 className={styles.panelTitle}>Nothing matched &ldquo;{query}&rdquo;</h2>
          <p className={styles.bookMeta} style={{ marginTop: 10 }}>
            Try a different title or author, or{" "}
            <Link href="/dashboard/books/new" className={styles.upgradeLink} style={{ display: "inline-flex" }}>
              upload this book
            </Link>{" "}
            yourself.
          </p>
        </section>
      )}

      {/* ── Book grid ──────────────────────────────────────────────────────── */}
      {displayBooks.length > 0 && (
        <section className={styles.libraryCardGrid}>
          {displayBooks.map((book) => (
            <BookLibraryCard key={book._id ?? book.slug} book={book} />
          ))}
        </section>
      )}

      {/* ── Curated picks placeholder ─────────────────────────────────────── */}
      {!query && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Coming soon</p>
              <h3 className={styles.panelTitle}>Curated reading picks</h3>
            </div>
            <span className={styles.tinyPill}>In progress</span>
          </div>
          <p className={styles.bookMeta}>
            A hand-picked library of 20–30 popular books — already processed and ready for voice conversation. No upload needed.
          </p>
        </section>
      )}
    </>
  );
}
