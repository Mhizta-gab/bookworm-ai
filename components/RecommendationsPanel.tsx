"use client";

import { useEffect, useState } from "react";
import { Sparkles, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";
import styles from "@/components/dashboard/dashboard.module.css";
import type { ITranscriptMessage } from "@/types";

type Recommendation = {
  title: string;
  author: string;
  reason: string;
  inLibrary: boolean;
};

interface RecommendationsPanelProps {
  bookTitle: string;
  bookAuthor: string;
  messages: ITranscriptMessage[];
}

export function RecommendationsPanel({ bookTitle, bookAuthor, messages }: RecommendationsPanelProps) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const transcript = messages
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
      .join("\n");

    if (!transcript.trim()) {
      setIsLoading(false);
      return;
    }

    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        currentBookTitle: bookTitle,
        currentBookAuthor: bookAuthor,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.recommendations)) setRecs(data.recommendations);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  // Run once when the component mounts (session just ended)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className={styles.panel} style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={16} style={{ color: "#d68422" }} />
          <p className={styles.panelLabel}>Finding your next read…</p>
        </div>
      </div>
    );
  }

  if (!recs.length) return null;

  return (
    <div className={styles.panel} style={{ padding: "18px 22px", animation: "slideDown 250ms ease" }}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.panelLabel}>Based on your conversation</p>
          <h3 className={styles.panelTitle} style={{ fontSize: "1.1rem" }}>Read next</h3>
        </div>
        <Sparkles size={18} style={{ color: "#d68422", flexShrink: 0 }} />
      </div>

      <div className={styles.stack} style={{ gap: 10, marginTop: 14 }}>
        {recs.map((rec, i) => (
          <div key={i} className={styles.listRow} style={{ alignItems: "flex-start", padding: "12px 0" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: rec.inLibrary ? "#8293ff" : "#f2efe6",
                  border: "2px solid #181717",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <BookOpen size={16} style={{ color: rec.inLibrary ? "#fff" : "#181717" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <strong style={{ fontSize: "0.95rem", display: "block", marginBottom: 2 }}>{rec.title}</strong>
                <p className={styles.bookMeta} style={{ margin: "0 0 4px" }}>{rec.author}</p>
                <p className={styles.bookMeta} style={{ margin: 0, fontStyle: "italic" }}>{rec.reason}</p>
              </div>
            </div>

            {rec.inLibrary ? (
              <Link href={`/dashboard/library`} className={styles.ghostButton} style={{ flexShrink: 0, minHeight: 34, fontSize: "0.82rem" }}>
                <ExternalLink size={12} />
                Open
              </Link>
            ) : (
              <Link href={`/dashboard/books/new`} className={styles.microButton} style={{ flexShrink: 0, minHeight: 34, fontSize: "0.82rem" }}>
                Upload
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
