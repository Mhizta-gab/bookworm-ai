// Vapi configuration, voice persona definitions, and upload limits.

export const ASSISTANT_ID =
  process.env.NEXT_PUBLIC_ASSISTANT_ID || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export const VOICE_PERSONAS = [
  {
    id: "daniel",
    name: "Daniel",
    gender: "Male",
    character: "Warm, thoughtful, articulate",
    bestFor: "Non-fiction, self-help, biography",
    voiceId: "onwK4e9ZLuTAKqWW03F9",
  },
  {
    id: "rachel",
    name: "Rachel",
    gender: "Female",
    character: "Clear, calm, professional",
    bestFor: "Academic texts, science, business",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
  },
  {
    id: "chris",
    name: "Chris",
    gender: "Male",
    character: "Energetic, conversational, upbeat",
    bestFor: "Fiction, adventure, personal development",
    voiceId: "iP95p4xoKVk53GoZ742B",
  },
  {
    id: "aria",
    name: "Aria",
    gender: "Female",
    character: "Expressive, engaging, storytelling",
    bestFor: "Literature, fiction, memoirs",
    voiceId: "9BWtsMINqrJLrRacOk9x",
  },
  {
    id: "marcus",
    name: "Marcus",
    gender: "Male",
    character: "Deep, measured, authoritative",
    bestFor: "History, philosophy, technical books",
    voiceId: "CwhRBWXzGAHq8TQ4Fs17",
  },
] as const;

export type PersonaId = (typeof VOICE_PERSONAS)[number]["id"];

export const DEFAULT_VOICE: PersonaId = "daniel";

/** Look up a voice persona by its id or voiceId. Falls back to daniel. */
export function getVoice(idOrVoiceId: string) {
  return (
    VOICE_PERSONAS.find(
      (vp) => vp.id === idOrVoiceId || vp.voiceId === idOrVoiceId,
    ) ?? VOICE_PERSONAS[0]
  );
}

export const VOICE_SETTINGS = {
  stability: 0.45,
  similarityBoost: 0.75,
  style: 0,
  useSpeakerBoost: true,
  speed: 1.0,
} as const;

// ─── Vapi conversation ───────────────────────────────────────────────────────

/**
 * Injected as the assistant's opening line when starting a Vapi session.
 * {{bookTitle}} and {{author}} are replaced at runtime in useVapi.ts.
 */
export const VAPI_FIRST_MESSAGE =
  "Hey, good to meet you. Quick question before we dive in — have you actually read {{bookTitle}} by {{author}} yet, or are we starting fresh?";

// ─── Upload validation limits ────────────────────────────────────────────────

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB — PDF uploads
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB — cover image uploads
export const ACCEPTED_PDF_TYPES = ["application/pdf"] as const;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

// ─── PDF segmentation ────────────────────────────────────────────────────────

export const MAX_PDF_SIZE_MB = 50;
export const MAX_COVER_SIZE_MB = 10;
export const SEGMENT_WORD_LIMIT = 500;
export const SEGMENT_OVERLAP_WORDS = 80;
