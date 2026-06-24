"use client";

import { ArrowUpRight, AudioLines, Users } from "lucide-react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import type { BookWithStats } from "@/lib/actions/book.actions";
import type { DashboardBook } from "./mock-data";

type RealBook = BookWithStats & { slug: string; accent?: string };
type AnyBook = RealBook | DashboardBook;

function isRealBook(book: AnyBook): book is RealBook {
  return "sessionCount" in book;
}

// Deterministic accent from title (for no-cover fallback)
const ACCENTS = [
  "linear-gradient(145deg, #6d67f0 0%, #a8a4ff 100%)",
  "linear-gradient(145deg, #d68422 0%, #f5b84a 100%)",
  "linear-gradient(145deg, #2d7dd2 0%, #73b4ef 100%)",
  "linear-gradient(145deg, #3a9e6f 0%, #72d5a8 100%)",
  "linear-gradient(145deg, #c85c8e 0%, #f2a0c3 100%)",
  "linear-gradient(145deg, #181717 0%, #4a4745 100%)",
];

function accentForTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

export function BookLibraryCard({ book }: { book: AnyBook }) {
  const sessions = isRealBook(book) ? book.sessionCount : ((book as DashboardBook).sessions ?? 0);
  const readers  = isRealBook(book) ? book.readerCount  : 0;
  const status   = (book as DashboardBook).status ?? (isRealBook(book) && book.totalSegments > 0 ? "Ready" : "Processing");
  const accent   = (book as DashboardBook).accent ?? accentForTitle(book.title);

  return (
    <Link href={`/dashboard/books/${book.slug}`} className={styles.libraryCardLink}>
      <article className={styles.libraryCard}>

        {/* ── Full-bleed hero ─────────────────────────────────────────── */}
        <div className={styles.libraryCardHero} style={!book.coverUrl ? { background: accent } : undefined}>

          {/* Cover image */}
          {book.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverUrl}
              alt={book.title}
              className={styles.libraryCoverImage}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}

          {/* Gradient scrim (always on top of image) */}
          <div className={styles.libraryCoverGradient} />

          {/* Top row: status badge + session count */}
          <div className={styles.libraryCoverTop}>
            <span
              className={styles.accentPill}
              style={{ fontSize: "0.68rem", minHeight: 22, padding: "0 8px" }}
            >
              {status}
            </span>

            {sessions > 0 && (
              <div className={styles.libraryCoverStat}>
                <span className={styles.libraryCoverStatNum}>{sessions}</span>
                <span className={styles.libraryCoverStatLabel}>
                  {sessions === 1 ? "session" : "sessions"}
                </span>
              </div>
            )}
          </div>

          {/* Bottom: title + author overlaid on image */}
          <div className={styles.libraryCoverBottom}>
            <h3 className={styles.libraryCoverTitle}>{book.title}</h3>
            <p className={styles.libraryCoverAuthor}>{book.author}</p>
          </div>
        </div>

        {/* ── Footer row ─────────────────────────────────────────────── */}
        <div className={styles.libraryCardFooterRow}>
          <div className={styles.libraryCardPills}>
            <span className={styles.tinyPill}>{book.persona}</span>
            {readers > 0 && (
              <span className={styles.tinyPill}>
                <Users size={11} />
                {readers} {readers === 1 ? "reader" : "readers"}
              </span>
            )}
          </div>

          <span className={styles.libraryCardArrow}>
            <ArrowUpRight size={16} />
          </span>
        </div>

      </article>
    </Link>
  );
}
