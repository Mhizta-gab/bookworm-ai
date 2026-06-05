"use client";

import { ITranscriptMessage } from "@/types";
import styles from "@/components/dashboard/dashboard.module.css";

interface TranscriptProps {
  messages: ITranscriptMessage[];
  currentMessage?: string;
  currentUserMessage?: string;
}

function CursorText({ text }: { text: string }) {
  return (
    <>
      {text}
      <span className={styles.liveCursor} aria-hidden="true" />
    </>
  );
}

export default function Transcript({ messages, currentMessage = "", currentUserMessage = "" }: TranscriptProps) {
  const hasContent = messages.length > 0 || currentMessage || currentUserMessage;

  return (
    <div className={styles.voiceTranscript} aria-live="polite" aria-label="Live voice transcript">
      {!hasContent ? (
        <div className={styles.transcriptEmpty}>
          <strong>No transcript yet</strong>
          <p className={styles.bookMeta}>Start a voice session and the conversation will appear here in real time.</p>
        </div>
      ) : null}

      {messages.map((msg, i) => (
        <div
          key={`${msg.role}-${msg.timestamp?.toString() ?? i}-${msg.content}`}
          className={`${styles.transcriptRow} ${msg.role === "assistant" ? styles.transcriptAssistant : ""}`}
        >
          <div className={styles.transcriptBubble}>
            <div className={styles.transcriptRole}>{msg.role === "assistant" ? "Bookworm" : "You"}</div>
            <div>{msg.content}</div>
          </div>
        </div>
      ))}

      {currentUserMessage ? (
        <div className={styles.transcriptRow}>
          <div className={`${styles.transcriptBubble} ${styles.transcriptLiveBubble}`}>
            <div className={styles.transcriptRole}>You</div>
            <div>
              <CursorText text={currentUserMessage} />
            </div>
          </div>
        </div>
      ) : null}

      {currentMessage ? (
        <div className={`${styles.transcriptRow} ${styles.transcriptAssistant}`}>
          <div className={`${styles.transcriptBubble} ${styles.transcriptLiveBubble}`}>
            <div className={styles.transcriptRole}>Bookworm</div>
            <div>
              <CursorText text={currentMessage} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
