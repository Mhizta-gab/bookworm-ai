// Global TypeScript interfaces and types for Bookworm AI

// ─── Voice Session ──────────────────────────────────────────────────────────

export type VapiSessionStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "ended";

export interface ITranscriptMessage {
  role: "user" | "assistant";
  content: string;
  isFinal?: boolean;
  timestamp?: Date;
}

// ─── Book ────────────────────────────────────────────────────────────────────

export interface IBook {
  _id: string;
  clerkId: string;
  title: string;
  author: string;
  slug: string;
  persona: string; // ElevenLabs voice ID
  fileUrl: string;
  coverUrl: string;
  fileSize: number;
  totalSegments: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBookSegment {
  _id: string;
  bookId: string;
  content: string;
  segmentIndex: number;
  pageNumber?: number;
  wordCount: number;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface IUserProfile {
  clerkId: string;
  displayName: string;
  bio?: string;
  favoriteGenres: string[];
  booksRead: string[];
  followers: string[];
  following: string[];
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface IComment {
  _id: string;
  bookId: string;
  clerkId: string;
  content: string;
  likes: string[];
  parentId?: string;
  createdAt: string;
}

// ─── Forms ───────────────────────────────────────────────────────────────────

export interface BookUploadFormData {
  title: string;
  author: string;
  personaId: string;
  pdfFile: File;
  coverFile?: File;
}

// ─── Vapi Tool ───────────────────────────────────────────────────────────────

// Payload sent by Vapi when it calls /api/vapi/search-book
export interface VapiSearchBookRequest {
  bookId: string;
  query: string;
}
