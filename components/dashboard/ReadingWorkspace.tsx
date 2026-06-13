"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import { ReadingStudio } from "@/components/dashboard/ReadingStudio";
import styles from "./dashboard.module.css";
import Link from "next/link";

interface ReadingWorkspaceProps {
  bookId: string;
  bookTitle: string;
  author: string;
  starterPrompt: string;
  voiceId?: string;
  isDemoBook: boolean;
  bookCardNode: React.ReactNode;
}

export function ReadingWorkspace({
  bookId,
  bookTitle,
  author,
  starterPrompt,
  voiceId,
  isDemoBook,
  bookCardNode,
}: ReadingWorkspaceProps) {
  const [savedNotes, setSavedNotes] = useState<{ title: string; content: string }[]>([
    {
      title: "Identity before outcomes",
      content: "Saved from a chapter four recap. Focus on who you want to become, not just what you want to achieve.",
    },
    {
      title: "Morning habit starter",
      content: "Generated as a practical next-step list to begin implementing the two-minute rule.",
    },
  ]);

  const handleSaveNote = (title: string, content: string) => {
    setSavedNotes((prev) => [{ title, content }, ...prev]);
  };

  return (
    <section className={styles.readingDeskGrid}>
      <div className={styles.stack}>
        {!isDemoBook ? (
          <ReadingStudio
            bookId={bookId}
            bookTitle={bookTitle}
            author={author}
            starterPrompt={starterPrompt}
            voiceId={voiceId}
            onSaveNote={handleSaveNote}
          />
        ) : (
          <article className={styles.panel}>
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
          </article>
        )}
      </div>

      <div className={styles.stack}>
        {bookCardNode}

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelLabel}>Saved outputs</p>
              <h3 className={styles.panelTitle}>Highlights and notes</h3>
            </div>
          </div>
          <div className={styles.stack}>
            {savedNotes.map((note, index) => (
              <div key={index} className={styles.listRow}>
                <div>
                  <strong>{note.title}</strong>
                  <p className={styles.bookMeta}>{note.content.substring(0, 100)}{note.content.length > 100 ? "..." : ""}</p>
                </div>
                <Quote size={16} />
              </div>
            ))}
            <div className={styles.commentsComposer}>
              <div className={styles.composerBox}>
                Ask a follow-up, pin a note, or turn a spoken answer into a reusable summary.
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
