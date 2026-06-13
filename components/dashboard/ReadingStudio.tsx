"use client";

import { useState } from "react";
import { Mic, MessageSquare } from "lucide-react";
import VapiControls from "@/components/VapiControls";
import { BookChatPanel } from "@/components/dashboard/BookChatPanel";
import styles from "./dashboard.module.css";

export interface ReadingStudioProps {
  bookId: string;
  bookTitle: string;
  author: string;
  starterPrompt: string;
  voiceId?: string;
  onSaveNote: (title: string, content: string) => void;
}

export function ReadingStudio({ bookId, bookTitle, author, starterPrompt, voiceId, onSaveNote }: ReadingStudioProps) {
  const [activeTab, setActiveTab] = useState<"voice" | "text">("voice");

  return (
    <article className={styles.panel} id="reading-studio">
      <div className={styles.studioTabs}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "voice" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("voice")}
        >
          <Mic size={16} />
          Voice Session
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "text" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("text")}
        >
          <MessageSquare size={16} />
          Text Chat
        </button>
      </div>

      <div className={styles.studioContent}>
        {activeTab === "voice" && (
          <VapiControls bookId={bookId} bookTitle={bookTitle} author={author} voiceId={voiceId} onSaveNote={onSaveNote} />
        )}
        {activeTab === "text" && (
          <BookChatPanel bookId={bookId} bookTitle={bookTitle} starterPrompt={starterPrompt} />
        )}
      </div>
    </article>
  );
}
