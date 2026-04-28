"use client";
// useVapi — full voice session state machine
// States: idle | connecting | listening | thinking | speaking | ended
// Integrates with @vapi-ai/web SDK

import { useState, useCallback, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { ITranscriptMessage, VapiSessionStatus } from "@/types";
import { VAPI_FIRST_MESSAGE, VAPI_SYSTEM_PROMPT, VOICE_PERSONAS } from "@/lib/constants";

const vapiClient = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);

interface StartSessionParams {
  bookId: string;
  bookTitle: string;
  author: string;
  personaId?: string;
  voiceId?: string;
}

export function useVapi() {
  const [status, setStatus] = useState<VapiSessionStatus>("idle");
  const [messages, setMessages] = useState<ITranscriptMessage[]>([]);
  const sessionIdRef = useRef<string | null>(null);

  const startSession = useCallback(
    async ({ bookId, bookTitle, author, voiceId }: StartSessionParams) => {
      setStatus("connecting");
      setMessages([]);

      // TODO: Implement full Vapi session start with:
      // - Dynamic first message injection
      // - System prompt with book context
      // - search_book tool configuration
      // - Voice override with ElevenLabs voiceId
      // - Event listeners: call-start, call-end, speech-start, speech-end, message
    },
    []
  );

  const stopSession = useCallback(async () => {
    // TODO: Stop Vapi call and save session to MongoDB via endVoiceSession action
    vapiClient.stop();
    setStatus("ended");
  }, []);

  return { status, messages, startSession, stopSession };
}
