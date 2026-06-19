"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { ITranscriptMessage, VapiSessionStatus } from "@/types";
import {
  ASSISTANT_ID,
  DEFAULT_VOICE,
  VAPI_FIRST_MESSAGE,
  VOICE_SETTINGS,
  getVoice,
} from "@/lib/constants";
import { startVoiceSession, endVoiceSession } from "@/lib/actions/session.actions";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const TIMER_INTERVAL_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const TIME_WARNING_THRESHOLD = 60; // seconds remaining before warning

// ─── Singleton Vapi client ────────────────────────────────────────────────────

let vapiInstance: Vapi | null = null;
function getVapiClient() {
  if (typeof window === "undefined") return null;
  if (!vapiInstance) {
    if (!VAPI_API_KEY) {
      console.warn("NEXT_PUBLIC_VAPI_API_KEY is not configured.");
      return null;
    }
    vapiInstance = new Vapi(VAPI_API_KEY);
  }
  return vapiInstance;
}

// ─── useLatestRef helper ──────────────────────────────────────────────────────

/** Keeps a ref in sync with the latest value without triggering re-renders. */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

// ─── Error parsing helpers ────────────────────────────────────────────────────

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function getVapiErrorText(error: unknown) {
  if (typeof error === "string") return error;

  const root = asRecord(error);
  if (typeof root.error === "string") return root.error;

  const errorPayload = asRecord(root.error);
  const nestedError = asRecord(errorPayload.error);
  const nestedMessage = asRecord(errorPayload.message);

  return (
    (typeof errorPayload.errorMsg === "string" && errorPayload.errorMsg) ||
    (typeof nestedError.msg === "string" && nestedError.msg) ||
    (typeof nestedMessage.msg === "string" && nestedMessage.msg) ||
    (typeof root.errorMsg === "string" && root.errorMsg) ||
    (typeof root.message === "string" && root.message) ||
    ""
  );
}

function isExpectedRoomEndedError(error: unknown) {
  const text = getVapiErrorText(error).toLowerCase();
  const root = asRecord(error);
  const errorPayload = asRecord(root.error);
  const nestedError = asRecord(errorPayload.error);
  const nestedMessage = asRecord(errorPayload.message);

  return (
    text.includes("meeting has ended") ||
    text.includes("room was deleted") ||
    nestedError.type === "no-room" ||
    nestedMessage.type === "no-room"
  );
}

// ─── StartSession params ──────────────────────────────────────────────────────

interface StartSessionParams {
  bookId: string;
  bookTitle: string;
  author: string;
  voiceId?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVapi() {
  const { limits } = useSubscription();

  const [status, setStatus] = useState<VapiSessionStatus>("idle");
  const [messages, setMessages] = useState<ITranscriptMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [isBillingError, setIsBillingError] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const durationRef = useRef(0);
  const isStoppingRef = useRef(false);
  const ignoreRoomEndedErrorsUntilRef = useRef(0);
  const hasCallStartedRef = useRef(false);

  // Keep refs in sync with latest state for use inside event callbacks
  const maxDurationSeconds = limits.maxDurationPerSession * SECONDS_PER_MINUTE;
  const maxDurationRef = useLatestRef(maxDurationSeconds);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // ── Event handlers ─────────────────────────────────────────────────────────

  useEffect(() => {
    const client = getVapiClient();
    if (!client) return;

    const resetCallState = (nextStatus: VapiSessionStatus) => {
      setStatus(nextStatus);
      setCurrentMessage("");
      setCurrentUserMessage("");

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      startTimeRef.current = null;
    };

    const closeTrackedSession = (context: string) => {
      if (!sessionIdRef.current) return;

      const sessionId = sessionIdRef.current;
      sessionIdRef.current = null;

      endVoiceSession(sessionId, durationRef.current).catch((err) =>
        console.error(`Failed to end voice session after ${context}:`, err)
      );
    };

    const handleCallStart = () => {
      hasCallStartedRef.current = true;
      isStoppingRef.current = false;
      setStatus("speaking"); // AI speaks first
      setCurrentMessage("");
      setCurrentUserMessage("");

      startTimeRef.current = Date.now();
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        if (!startTimeRef.current) return;

        const newDuration = Math.floor(
          (Date.now() - startTimeRef.current) / TIMER_INTERVAL_MS
        );
        setDuration(newDuration);
        durationRef.current = newDuration;

        // Enforce per-session duration cap
        if (newDuration >= maxDurationRef.current) {
          const client = getVapiClient();
          if (client) client.stop();
          setLimitError(
            `Session time limit (${Math.floor(
              maxDurationRef.current / SECONDS_PER_MINUTE
            )} min) reached. Upgrade your plan for longer sessions.`
          );
        }
      }, TIMER_INTERVAL_MS);
    };

    const ensureCallStarted = () => {
      if (!hasCallStartedRef.current) {
        handleCallStart();
      }
    };

    const handleCallEnd = () => {
      ignoreRoomEndedErrorsUntilRef.current = Date.now() + 5000;
      isStoppingRef.current = false;
      hasCallStartedRef.current = false;
      resetCallState("ended");
      closeTrackedSession("call end");
    };

    const handleSpeechStart = () => {
      ensureCallStarted();
      if (!isStoppingRef.current) {
        setStatus("speaking");
      }
    };

    const handleSpeechEnd = () => {
      if (!isStoppingRef.current) {
        setStatus("listening");
      }
    };

    const handleMessage = (message: {
      type?: string;
      role?: "user" | "assistant" | "bot" | "model";
      transcriptType?: "partial" | "final";
      transcript?: string;
    }) => {
      ensureCallStarted();
      if (message.type !== "transcript" || !message.role || !message.transcriptType) return;
      const transcript = message.transcript?.trim() ?? "";
      if (!transcript) return;

      // Normalize role — Vapi sometimes uses 'bot' instead of 'assistant'
      const role =
        message.role === "bot" || message.role === "model"
          ? "assistant"
          : message.role;

      if (role === "user" && message.transcriptType === "final") {
        if (!isStoppingRef.current) setStatus("thinking");
        setCurrentUserMessage("");
      }

      if (role === "user" && message.transcriptType === "partial") {
        setCurrentUserMessage(transcript);
        return;
      }

      if (role === "assistant" && message.transcriptType === "partial") {
        setCurrentMessage(transcript);
        return;
      }

      if (message.transcriptType === "final") {
        if (role === "assistant") setCurrentMessage("");
        if (role === "user") setCurrentUserMessage("");

        setMessages((prev) => {
          const isDupe = prev.some(
            (m) => m.role === role && m.content === transcript
          );
          if (isDupe) return prev;
          return [
            ...prev,
            {
              role: role as "user" | "assistant",
              content: transcript,
              isFinal: true,
              timestamp: new Date(),
            },
          ];
        });
      }
    };

    const handleError = (error: unknown) => {
      if (isExpectedRoomEndedError(error)) {
        const endedAfterConnection =
          hasCallStartedRef.current || isStoppingRef.current;
        resetCallState(endedAfterConnection ? "ended" : "idle");
        closeTrackedSession("room ended");
        hasCallStartedRef.current = false;

        if (!endedAfterConnection) {
          toast.error(
            "Voice call ended before connecting. Check Vapi provider credentials and the selected ElevenLabs voice."
          );
        }

        return;
      }

      console.error("Vapi error:", error);
      resetCallState("idle");

      // Show user-friendly error for common cases
      const errorText = getVapiErrorText(error).toLowerCase();
      if (errorText.includes("timeout") || errorText.includes("silence")) {
        setLimitError("Session ended due to inactivity. Click the mic to start again.");
      } else if (errorText.includes("network") || errorText.includes("connection")) {
        setLimitError("Connection lost. Please check your internet and try again.");
      } else {
        toast.error(getVapiErrorText(error) || "Vapi error occurred");
      }

      try {
        if (client) client.stop();
      } catch (e) {
        console.error("Failed to stop Vapi client on error:", e);
      }

      closeTrackedSession("error");
      hasCallStartedRef.current = false;
    };

    const handleCallStartFailed = (event: unknown) => {
      console.error("Vapi call start failed:", event);
      resetCallState("idle");
      closeTrackedSession("call start failure");
      hasCallStartedRef.current = false;
      
      if (isExpectedRoomEndedError(event)) {
        toast.error(
          "Voice call ended before connecting. Check Vapi provider credentials and the selected voice."
        );
      } else {
        toast.error(getVapiErrorText(event) || "Voice call failed before connecting.");
      }
    };

    client.on("call-start", handleCallStart);
    client.on("call-end", handleCallEnd);
    client.on("speech-start", handleSpeechStart);
    client.on("speech-end", handleSpeechEnd);
    client.on("message", handleMessage as () => void);
    client.on("error", handleError);
    client.on("call-start-failed", handleCallStartFailed);

    return () => {
      client.off("call-start", handleCallStart);
      client.off("call-end", handleCallEnd);
      client.off("speech-start", handleSpeechStart);
      client.off("speech-end", handleSpeechEnd);
      client.off("message", handleMessage as () => void);
      client.off("error", handleError);
      client.off("call-start-failed", handleCallStartFailed);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── startSession ───────────────────────────────────────────────────────────

  const startSession = useCallback(
    async ({ bookId, bookTitle, author, voiceId }: StartSessionParams) => {
      setStatus("connecting");
      setMessages([]);
      setCurrentMessage("");
      setCurrentUserMessage("");
      setLimitError(null);
      setIsBillingError(false);
      isStoppingRef.current = false;
      hasCallStartedRef.current = false;

      // Yield to browser so the "Connecting…" state paints before the async work
      await new Promise((resolve) => setTimeout(resolve, 10));

      const client = getVapiClient();
      if (!client) {
        setStatus("idle");
        toast.error("Vapi client is not configured. Check NEXT_PUBLIC_VAPI_API_KEY.");
        return;
      }

      // ── Server-side limit check & session creation ──────────────────────────
      try {
        const response = await startVoiceSession(bookId);

        if (!response.success || !response.sessionId) {
          setStatus("idle");
          if (response.isBillingError) {
            setIsBillingError(true);
            setLimitError(response.error ?? "Session limit reached. Please upgrade your plan.");
          } else {
            toast.error(response.error ?? "Failed to start session.");
          }
          return;
        }

        sessionIdRef.current = response.sessionId;

        // ── Build first message ───────────────────────────────────────────────
        const firstMessage = VAPI_FIRST_MESSAGE
          .replace("{{bookTitle}}", bookTitle)
          .replace("{{author}}", author);

        // ── Resolve voice persona ─────────────────────────────────────────────
        const voicePersona = getVoice(voiceId ?? DEFAULT_VOICE);

        // ── Start the pre-configured Vapi Dashboard assistant ─────────────────
        // We only override firstMessage and variableValues —
        // the system prompt, tools, voice, and LLM settings live on the dashboard.
        await client.start(ASSISTANT_ID, {
          firstMessage,
          variableValues: {
            title: bookTitle,
            author,
            bookId,
          },
        });

        // Fallback: if call-start event fires before we reach this line, skip
        if (!hasCallStartedRef.current) {
          hasCallStartedRef.current = true;
          setStatus("speaking");
          startTimeRef.current = Date.now();
          setDuration(0);
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            if (!startTimeRef.current) return;
            const newDuration = Math.floor(
              (Date.now() - startTimeRef.current) / TIMER_INTERVAL_MS
            );
            setDuration(newDuration);
            durationRef.current = newDuration;
            if (newDuration >= maxDurationRef.current) {
              getVapiClient()?.stop();
              setLimitError(
                `Session time limit (${Math.floor(
                  maxDurationRef.current / SECONDS_PER_MINUTE
                )} min) reached. Upgrade your plan for longer sessions.`
              );
            }
          }, TIMER_INTERVAL_MS);
        }
      } catch (error) {
        console.error("Failed to start Vapi call:", error);
        setStatus("idle");
        toast.error("Failed to start voice call. Please try again.");
      }
    },
    [maxDurationRef] // maxDurationRef is stable (a ref object), but listed for clarity
  );

  // ── stopSession ────────────────────────────────────────────────────────────

  const stopSession = useCallback(async () => {
    isStoppingRef.current = true;
    ignoreRoomEndedErrorsUntilRef.current = Date.now() + 5000;
    const client = getVapiClient();
    if (client) client.stop();
    setStatus("ended");
  }, []);

  // ── clearError ─────────────────────────────────────────────────────────────

  const clearError = useCallback(() => {
    setLimitError(null);
    setIsBillingError(false);
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  const isActive =
    status === "connecting" ||
    status === "listening" ||
    status === "thinking" ||
    status === "speaking";

  const remainingSeconds = Math.max(0, maxDurationSeconds - duration);
  const showTimeWarning = isActive && remainingSeconds <= TIME_WARNING_THRESHOLD && remainingSeconds > 0;

  return {
    status,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    isActive,
    limitError,
    isBillingError,
    maxDurationSeconds,
    remainingSeconds,
    showTimeWarning,
    startSession,
    stopSession,
    clearError,
  };
}

export default useVapi;
