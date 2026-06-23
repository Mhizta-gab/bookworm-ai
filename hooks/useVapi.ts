"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { ASSISTANT_ID, VOICE_PERSONAS, VOICE_SETTINGS } from "@/lib/constants";
import { startVoiceSession, endVoiceSession } from "@/lib/actions/session.actions";
import { useSubscription } from "@/hooks/useSubscription";
import type { ITranscriptMessage, VapiSessionStatus } from "@/types";

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const TIMER_INTERVAL_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const DEFAULT_MAX_DURATION_SECONDS = 15 * SECONDS_PER_MINUTE;

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

export function useLatestRef<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

type StartSessionParams = {
  bookId: string;
  bookTitle: string;
  author: string;
  voiceId?: string;
};

type TranscriptMessage = {
  type?: string;
  role?: "user" | "assistant" | "bot" | "model";
  transcriptType?: "partial" | "final";
  transcript?: string;
};

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

function isRoomEndedError(error: unknown) {
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

function getVoiceById(voiceId?: string) {
  return VOICE_PERSONAS.find((voice) => voice.id === voiceId || voice.voiceId === voiceId) ?? VOICE_PERSONAS[0];
}

export function useVapi() {
  const { limits } = useSubscription();
  const [status, setStatus] = useState<VapiSessionStatus>("idle");
  const [messages, setMessages] = useState<ITranscriptMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [isBillingError, setIsBillingError] = useState(false);
  const [sessionMaxDurationSeconds, setSessionMaxDurationSeconds] = useState<number | null>(null);
  const maxDurationSeconds =
    sessionMaxDurationSeconds ??
    (limits?.maxDurationPerSession
      ? limits.maxDurationPerSession * SECONDS_PER_MINUTE
      : DEFAULT_MAX_DURATION_SECONDS);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const durationRef = useLatestRef(duration);
  const maxDurationRef = useLatestRef(maxDurationSeconds);
  const isStoppingRef = useRef(false);
  const hasCallStartedRef = useRef(false);

  useEffect(() => {
    const client = getVapiClient();
    if (!client) return;

    const stopTimer = () => {
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

      endVoiceSession(sessionId, durationRef.current).catch((error) =>
        console.error(`Failed to end voice session after ${context}:`, error)
      );
    };

    const startTimer = () => {
      startTimeRef.current = Date.now();
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        if (!startTimeRef.current) return;

        const nextDuration = Math.floor((Date.now() - startTimeRef.current) / TIMER_INTERVAL_MS);
        setDuration(nextDuration);

        if (nextDuration >= maxDurationRef.current) {
          isStoppingRef.current = true;
          client.stop();
          setLimitError(
            `Session time limit (${Math.floor(
              maxDurationRef.current / SECONDS_PER_MINUTE
            )} minutes) reached. Upgrade your plan for longer sessions.`
          );
        }
      }, TIMER_INTERVAL_MS);
    };

    const resetCallState = (nextStatus: VapiSessionStatus) => {
      setStatus(nextStatus);
      setCurrentMessage("");
      setCurrentUserMessage("");
      stopTimer();
    };

    const handleCallStart = () => {
      hasCallStartedRef.current = true;
      isStoppingRef.current = false;
      setStatus("starting");
      setCurrentMessage("");
      setCurrentUserMessage("");
      startTimer();
    };

    const ensureCallStarted = () => {
      if (!hasCallStartedRef.current) {
        handleCallStart();
      }
    };

    const handleCallEnd = () => {
      hasCallStartedRef.current = false;
      isStoppingRef.current = false;
      resetCallState("ended");
      closeTrackedSession("call end");
    };

    const handleSpeechStart = () => {
      ensureCallStarted();
      if (!isStoppingRef.current) setStatus("speaking");
    };

    const handleSpeechEnd = () => {
      if (!isStoppingRef.current) setStatus("listening");
    };

    const handleMessage = (message: TranscriptMessage) => {
      if (message.type !== "transcript" || !message.role || !message.transcriptType) return;

      ensureCallStarted();
      const transcript = message.transcript?.trim() ?? "";
      if (!transcript) return;

      const role = message.role === "bot" || message.role === "model" ? "assistant" : message.role;

      if (role === "user" && message.transcriptType === "partial") {
        setCurrentUserMessage(transcript);
        return;
      }

      if (role === "assistant" && message.transcriptType === "partial") {
        setCurrentMessage(transcript);
        return;
      }

      if (role === "user" && message.transcriptType === "final") {
        if (!isStoppingRef.current) setStatus("thinking");
        setCurrentUserMessage("");
      }

      if (message.transcriptType === "final") {
        if (role === "assistant") setCurrentMessage("");
        if (role === "user") setCurrentUserMessage("");

        setMessages((current) => {
          const isDuplicate = current.some((item) => item.role === role && item.content === transcript);
          if (isDuplicate) return current;

          return [
            ...current,
            {
              role,
              content: transcript,
              isFinal: true,
              timestamp: new Date(),
            },
          ];
        });
      }
    };

    const handleError = (error: unknown) => {
      if (isRoomEndedError(error)) {
        const connectedBeforeEnd = hasCallStartedRef.current || isStoppingRef.current;
        resetCallState(connectedBeforeEnd ? "ended" : "idle");
        closeTrackedSession("room ended");
        hasCallStartedRef.current = false;

        if (!connectedBeforeEnd) {
          setLimitError("Voice call ended before connecting. Check the Vapi dashboard assistant and provider credentials.");
        }

        return;
      }

      console.error("Vapi error:", error);
      resetCallState("idle");
      closeTrackedSession("error");
      hasCallStartedRef.current = false;
      setLimitError(getVapiErrorText(error) || "Session ended unexpectedly. Click the mic to start again.");
    };

    const handleCallStartFailed = (event: unknown) => {
      console.error("Vapi call start failed:", event);
      resetCallState("idle");
      closeTrackedSession("call start failure");
      hasCallStartedRef.current = false;
      setLimitError(getVapiErrorText(event) || "Voice call failed before connecting.");
    };

    client.on("call-start", handleCallStart);
    client.on("call-end", handleCallEnd);
    client.on("speech-start", handleSpeechStart);
    client.on("speech-end", handleSpeechEnd);
    client.on("message", handleMessage);
    client.on("error", handleError);
    client.on("call-start-failed", handleCallStartFailed);

    return () => {
      client.off("call-start", handleCallStart);
      client.off("call-end", handleCallEnd);
      client.off("speech-start", handleSpeechStart);
      client.off("speech-end", handleSpeechEnd);
      client.off("message", handleMessage);
      client.off("error", handleError);
      client.off("call-start-failed", handleCallStartFailed);

      if (sessionIdRef.current) {
        client.stop();
        closeTrackedSession("unmount");
      }
      stopTimer();
    };
  }, [durationRef, maxDurationRef]);

  const closeActiveSession = useCallback(() => {
    if (!sessionIdRef.current) return;

    const sessionId = sessionIdRef.current;
    sessionIdRef.current = null;

    endVoiceSession(sessionId, durationRef.current).catch((error) =>
      console.error("Failed to close voice session:", error)
    );
  }, [durationRef]);

  const startSession = useCallback(
    async ({ bookId, bookTitle, author, voiceId }: StartSessionParams) => {
      setLimitError(null);
      setIsBillingError(false);
      setStatus("connecting");
      setMessages([]);
      setCurrentMessage("");
      setCurrentUserMessage("");
      setDuration(0);
      setSessionMaxDurationSeconds(null);
      isStoppingRef.current = false;
      hasCallStartedRef.current = false;

      const client = getVapiClient();
      if (!client) {
        setStatus("idle");
        setLimitError("Vapi client is not configured. Check NEXT_PUBLIC_VAPI_API_KEY.");
        return;
      }

      if (!ASSISTANT_ID) {
        setStatus("idle");
        setLimitError("NEXT_PUBLIC_ASSISTANT_ID is not configured.");
        return;
      }

      try {
        const response = await startVoiceSession(bookId);

        if (!response.success || !response.sessionId) {
          setStatus("idle");
          setIsBillingError(Boolean(response.isBillingError));
          setLimitError(response.error || "Failed to start voice session.");
          return;
        }

        sessionIdRef.current = response.sessionId;

        if (response.maxDurationMinutes) {
          setSessionMaxDurationSeconds(response.maxDurationMinutes * SECONDS_PER_MINUTE);
        }

        const voicePersona = getVoiceById(voiceId);
        const firstMessage = `Hey, good to meet you. Quick question before we dive in - have you actually read ${bookTitle} yet, or are we starting fresh?`;

        await client.start(ASSISTANT_ID, {
          firstMessage,
          variableValues: {
            title: bookTitle,
            author,
            bookId,
          },
          voice: {
            provider: "11labs",
            voiceId: voicePersona.voiceId,
            model: "eleven_turbo_v2_5",
            stability: VOICE_SETTINGS.stability,
            similarityBoost: VOICE_SETTINGS.similarityBoost,
            style: VOICE_SETTINGS.style,
            useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
            speed: VOICE_SETTINGS.speed,
          },
        });
      } catch (error) {
        console.error("Failed to start Vapi call:", error);
        setStatus("idle");
        setLimitError("Failed to start voice session. Please try again.");
        closeActiveSession();
      }
    },
    [closeActiveSession]
  );

  const stopSession = useCallback(() => {
    isStoppingRef.current = true;
    const client = getVapiClient();
    if (client) client.stop();
  }, []);

  const clearError = useCallback(() => {
    setLimitError(null);
    setIsBillingError(false);
  }, []);

  const isActive =
    status === "starting" ||
    status === "connecting" ||
    status === "listening" ||
    status === "thinking" ||
    status === "speaking";

  const remainingSeconds = Math.max(0, maxDurationSeconds - duration);
  const showTimeWarning = isActive && remainingSeconds <= 60 && remainingSeconds > 0;

  return {
    status,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    isActive,
    startSession,
    stopSession,
    limitError,
    isBillingError,
    maxDurationSeconds,
    remainingSeconds,
    showTimeWarning,
    clearError,
  };
}

export default useVapi;
