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

export default function VapiControls({ bookId, bookTitle, author, voiceId }: VapiControlsProps) {
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

  async function handleToggle() {
    if (isActive) {
      await stopSession();
      return;
    }

    await startSession({ bookId, bookTitle, author, voiceId });
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
            aria-label={isActive ? "End voice session" : "Start voice session"}
          >
            {isConnecting ? <Radio size={30} /> : isActive ? <PhoneOff size={30} /> : <Mic size={30} />}
          </button>
        </div>

        <div className={styles.voiceHeroText}>
          <span className={styles.statusPill}>
            <Sparkles size={15} />
            {statusText[status]}
          </span>
          <h4 className={styles.voiceTitle}>{isActive ? "Live with the book" : "Start a grounded voice session"}</h4>
          <p className={styles.bookMeta}>
            {isActive
              ? "Ask naturally. The assistant will search the saved book passages when it needs evidence."
              : `Talk with ${bookTitle} using the selected ElevenLabs voice persona.`}
          </p>
        </div>
      </div>

      <div className={styles.voiceStats}>
        <div>
          <span className={styles.panelLabel}>Duration</span>
          <strong>{formatDuration(duration)}</strong>
        </div>
        <div>
          <span className={styles.panelLabel}>Transcript</span>
          <strong>{messages.length} turns</strong>
        </div>
        <div>
          <span className={styles.panelLabel}>Mode</span>
          <strong>RAG voice</strong>
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
          {isConnecting ? "Connecting..." : isActive ? "End session" : "Start voice session"}
        </button>
      </div>

      <Transcript messages={messages} currentMessage={currentMessage} currentUserMessage={currentUserMessage} />
    </div>
  );
}
