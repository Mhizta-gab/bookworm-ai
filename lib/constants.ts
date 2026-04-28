// constants.ts — Vapi configuration, voice persona definitions, and ElevenLabs voice IDs

export const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// Voice personas — each maps to an ElevenLabs voice ID
// Replace the voiceId values with real ElevenLabs voice IDs from your account
export const VOICE_PERSONAS = [
  {
    id: "daniel",
    name: "Daniel",
    gender: "Male",
    character: "Warm, thoughtful, articulate",
    bestFor: "Non-fiction, self-help, biography",
    voiceId: "onwK4e9ZLuTAKqWW03F9", // ElevenLabs voice ID — replace with actual
  },
  {
    id: "rachel",
    name: "Rachel",
    gender: "Female",
    character: "Clear, calm, professional",
    bestFor: "Academic texts, science, business",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // ElevenLabs voice ID — replace with actual
  },
  {
    id: "chris",
    name: "Chris",
    gender: "Male",
    character: "Energetic, conversational, upbeat",
    bestFor: "Fiction, adventure, personal development",
    voiceId: "iP95p4xoKVk53GoZ742B", // ElevenLabs voice ID — replace with actual
  },
  {
    id: "aria",
    name: "Aria",
    gender: "Female",
    character: "Expressive, engaging, storytelling",
    bestFor: "Literature, fiction, memoirs",
    voiceId: "9BWtsMINqrJLrRacOk9x", // ElevenLabs voice ID — replace with actual
  },
  {
    id: "marcus",
    name: "Marcus",
    gender: "Male",
    character: "Deep, measured, authoritative",
    bestFor: "History, philosophy, technical books",
    voiceId: "CwhRBWXzGAHq8TQ4Fs17", // ElevenLabs voice ID — replace with actual
  },
] as const;

export type PersonaId = (typeof VOICE_PERSONAS)[number]["id"];

// Vapi system prompt template — injected at session start
export const VAPI_SYSTEM_PROMPT = `
You are the embodiment of the book "{{bookTitle}}" by {{author}}.
You have complete knowledge of this book's content. Answer every question 
based solely on the content retrieved from the book's segments.
If a question cannot be answered from the book's content, say so honestly.
Be engaging, thoughtful, and conversational. Bring the book's ideas to life.
`.trim();

// Vapi first message template
export const VAPI_FIRST_MESSAGE = `Hey! I'm ready to talk about {{bookTitle}} by {{author}}. What would you like to know?`;

// Book upload limits
export const MAX_PDF_SIZE_MB = 50;
export const MAX_COVER_SIZE_MB = 10;
export const SEGMENT_WORD_LIMIT = 500;
