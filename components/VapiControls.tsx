"use client";

import { Mic, MicOff, PhoneOff, Radio, Sparkles } from "lucide-react";
import { useVapi } from "@/hooks/useVapi";
import Transcript from "@/components/Transcript";
import type { VapiSessionStatus } from "@/types";
import styles from "@/components/dashboard/dashboard.module.css";

interface VapiControlsProps {
  bookId: string;
  bookTitle: string;
  author: string;
  voiceId?: string;
  onSaveNote: (title: string, content: string) => void;
}

const statusText: Record<VapiSessionStatus, string> = {
  idle: "Ready",
  connecting: "Connecting",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  ended: "Ended",
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

import { useState } from "react";

export default function VapiControls({ bookId, bookTitle, author, voiceId, onSaveNote }: VapiControlsProps) {
  const {
    status,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    isActive,
    startSession,
    stopSession,
  } = useVapi();

  const isConnecting = status === "connecting";
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  async function handleToggle() {
    if (isActive) {
      await stopSession();
      return;
    }

    await startSession({ bookId, bookTitle, author, voiceId });
  }

  async function handleSummarize() {
    if (messages.length === 0 || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const response = await fetch("/api/chat/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcripts: messages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to summarize.");
      
      setSummary(data.summary);
      onSaveNote(`Listening recap (${formatDuration(duration)})`, data.summary);
      alert("Recap saved to notes.");
    } catch (error) {
      console.error(error);
      alert("Could not save a recap right now.");
    } finally {
      setIsSummarizing(false);
    }
  }

  function handleExportSummary() {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bookTitle}-summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.voiceControlSurface}>
      <div className={styles.voiceHero}>
        <div className={styles.voiceOrbWrap}>
          {isActive ? <span className={styles.voicePulseRing} aria-hidden="true" /> : null}
          <button
            type="button"
            className={`${styles.voiceMicButton} ${isActive ? styles.voiceMicButtonActive : ""}`}
            onClick={handleToggle}
            disabled={isConnecting}
            aria-label={isActive ? "End listening" : "Start listening"}
          >
            {isConnecting ? <Radio size={30} /> : isActive ? <PhoneOff size={30} /> : <Mic size={30} />}
          </button>
        </div>

        <div className={styles.voiceHeroText}>
          <span className={styles.statusPill}>
            <Sparkles size={15} />
            {statusText[status]}
          </span>
          <h4 className={styles.voiceTitle}>{isActive ? "Live with the book" : "Start listening"}</h4>
          <p className={styles.bookMeta}>
            {isActive
              ? "Ask naturally. Bookworm will use the book when it needs evidence."
              : `Talk with ${bookTitle} using the reading voice you selected.`}
          </p>
        </div>
      </div>

      <div className={styles.voiceStats}>
        <div>
          <span className={styles.panelLabel}>Duration</span>
          <strong>{formatDuration(duration)}</strong>
        </div>
        <div>
          <span className={styles.panelLabel}>Exchange</span>
          <strong>{messages.length} turns</strong>
        </div>
        <div>
          <span className={styles.panelLabel}>Mode</span>
          <strong>Voice</strong>
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={isActive ? styles.secondaryButton : styles.primaryButton}
          onClick={handleToggle}
          disabled={isConnecting}
        >
          {isActive ? <MicOff size={16} /> : <Mic size={16} />}
          {isConnecting ? "Connecting..." : isActive ? "End listening" : "Start listening"}
        </button>
        
        {!isActive && messages.length > 0 && !summary && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleSummarize}
            disabled={isSummarizing}
          >
            <Sparkles size={16} />
            {isSummarizing ? "Saving recap..." : "Save recap"}
          </button>
        )}

        {!isActive && summary && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleExportSummary}
          >
            Download recap
          </button>
        )}
      </div>

      <Transcript messages={messages} currentMessage={currentMessage} currentUserMessage={currentUserMessage} />
    </div>
  );
}
