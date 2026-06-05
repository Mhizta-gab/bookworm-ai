"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { ITranscriptMessage, VapiSessionStatus } from "@/types";
import { VAPI_FIRST_MESSAGE, VAPI_SYSTEM_PROMPT, VOICE_PERSONAS } from "@/lib/constants";
import { startVoiceSession, endVoiceSession } from "@/lib/actions/session.actions";
import { toast } from "sonner";

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;

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

interface StartSessionParams {
  bookId: string;
  bookTitle: string;
  author: string;
  voiceId?: string;
}

type TranscriptMessage = {
  type?: string;
  role?: "user" | "assistant";
  transcriptType?: "partial" | "final";
  transcript?: string;
};

export function useVapi() {
  const [status, setStatus] = useState<VapiSessionStatus>("idle");
  const [messages, setMessages] = useState<ITranscriptMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUserMessage, setCurrentUserMessage] = useState("");
  const [duration, setDuration] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const durationRef = useRef(0);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Set up Vapi event listeners on mount
  useEffect(() => {
    const client = getVapiClient();
    if (!client) return;

    const handleCallStart = () => {
      isStoppingRef.current = false;
      setStatus("speaking"); // AI speaks first
      setCurrentMessage("");
      setCurrentUserMessage("");

      startTimeRef.current = Date.now();
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const newDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setDuration(newDuration);
        }
      }, 1000);
    };

    const handleCallEnd = () => {
      isStoppingRef.current = false;
      setStatus("ended");
      setCurrentMessage("");
      setCurrentUserMessage("");

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (sessionIdRef.current) {
        endVoiceSession(sessionIdRef.current, durationRef.current).catch((err) =>
          console.error("Failed to end voice session:", err)
        );
        sessionIdRef.current = null;
      }

      startTimeRef.current = null;
    };

    const handleSpeechStart = () => {
      if (!isStoppingRef.current) {
        setStatus("speaking");
      }
    };

    const handleSpeechEnd = () => {
      if (!isStoppingRef.current) {
        setStatus("listening");
      }
    };

    const handleMessage = (message: TranscriptMessage) => {
      if (message.type !== "transcript" || !message.role || !message.transcriptType) return;
      const transcript = message.transcript?.trim() ?? "";
      if (!transcript) return;

      if (message.role === "user" && message.transcriptType === "final") {
        if (!isStoppingRef.current) {
          setStatus("thinking");
        }
        setCurrentUserMessage("");
      }

      if (message.role === "user" && message.transcriptType === "partial") {
        setCurrentUserMessage(transcript);
        return;
      }

      if (message.role === "assistant" && message.transcriptType === "partial") {
        setCurrentMessage(transcript);
        return;
      }

      if (message.transcriptType === "final") {
        if (message.role === "assistant") setCurrentMessage("");
        if (message.role === "user") setCurrentUserMessage("");

        setMessages((prev) => {
          const isDupe = prev.some(
            (m) => m.role === message.role && m.content === transcript
          );
          if (isDupe) return prev;
          return [
            ...prev,
            {
              role: message.role as "user" | "assistant",
              content: transcript,
              isFinal: true,
              timestamp: new Date(),
            },
          ];
        });
      }
    };

    const handleError = (error: unknown) => {
      console.error("Vapi error:", error);
      setStatus("idle");
      setCurrentMessage("");
      setCurrentUserMessage("");

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (sessionIdRef.current) {
        endVoiceSession(sessionIdRef.current, durationRef.current).catch((err) =>
          console.error("Failed to end voice session on error:", err)
        );
        sessionIdRef.current = null;
      }

      startTimeRef.current = null;
    };

    client.on("call-start", handleCallStart);
    client.on("call-end", handleCallEnd);
    client.on("speech-start", handleSpeechStart);
    client.on("speech-end", handleSpeechEnd);
    client.on("message", handleMessage);
    client.on("error", handleError);

    return () => {
      client.off("call-start", handleCallStart);
      client.off("call-end", handleCallEnd);
      client.off("speech-start", handleSpeechStart);
      client.off("speech-end", handleSpeechEnd);
      client.off("message", handleMessage);
      client.off("error", handleError);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startSession = useCallback(
    async ({ bookId, bookTitle, author, voiceId }: StartSessionParams) => {
      setStatus("connecting");
      setMessages([]);
      setCurrentMessage("");
      setCurrentUserMessage("");
      isStoppingRef.current = false;

      const client = getVapiClient();
      if (!client) {
        setStatus("idle");
        toast.error("Vapi client is not configured. Check NEXT_PUBLIC_VAPI_API_KEY.");
        return;
      }

      try {
        const response = await startVoiceSession(bookId);
        if (!response.success || !response.sessionId) {
          setStatus("idle");
          toast.error(response.error || "Failed to start session in database.");
          return;
        }

        sessionIdRef.current = response.sessionId;

        const firstMessage = VAPI_FIRST_MESSAGE
          .replace("{{bookTitle}}", bookTitle)
          .replace("{{author}}", author);

        const systemPrompt = VAPI_SYSTEM_PROMPT
          .replace("{{bookTitle}}", bookTitle)
          .replace("{{author}}", author);

        const voicePersona = VOICE_PERSONAS.find((vp) => vp.id === voiceId || vp.voiceId === voiceId) || VOICE_PERSONAS[0];

        await client.start({
          name: `${bookTitle} Voice Companion`,
          firstMessage,
          voice: {
            provider: "11labs",
            voiceId: voicePersona.voiceId,
            model: "eleven_turbo_v2_5",
            stability: 0.45,
            similarityBoost: 0.75,
            style: 0,
            useSpeakerBoost: true,
          },
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
            ],
            temperature: 0.3,
            tools: [
              {
                type: "function",
                function: {
                  name: "searchBook",
                  description: `Searches the content of the book "${bookTitle}" by ${author} to retrieve matching passages. Use this tool whenever the user asks about the content of the book, characters, plots, or key ideas.`,
                  parameters: {
                    type: "object",
                    properties: {
                      bookId: {
                        type: "string",
                        description: "The ID of the current book. Use the provided value.",
                      },
                      query: {
                        type: "string",
                        description: "The topic or sentence to lookup in the book content."
                      }
                    },
                    required: ["query"]
                  },
                },
                server: {
                  url: `${window.location.origin}/api/vapi/search-book?bookId=${bookId}`,
                }
              }
            ]
          }
        });
      } catch (error) {
        console.error("Failed to start Vapi call:", error);
        setStatus("idle");
        toast.error("Failed to start voice call.");
      }
    },
    []
  );

  const stopSession = useCallback(async () => {
    isStoppingRef.current = true;
    const client = getVapiClient();
    if (client) {
      client.stop();
    }
    setStatus("ended");
  }, []);

  const isActive =
    status === "connecting" ||
    status === "listening" ||
    status === "thinking" ||
    status === "speaking";

  return {
    status,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    isActive,
    startSession,
    stopSession,
  };
}

export default useVapi;
