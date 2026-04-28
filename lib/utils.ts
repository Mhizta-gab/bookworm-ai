import { SEGMENT_WORD_LIMIT } from "@/lib/constants";

// parsePDF — extracts text content from a PDF file using pdfjs-dist
// Returns array of page texts
export async function parsePDF(file: File): Promise<string[]> {
  // TODO: Implement pdfjs-dist PDF text extraction
  // Must run client-side only (pdfjs-dist is browser-based)
  return [];
}

// splitIntoSegments — splits raw text into ~500-word chunks
export function splitIntoSegments(pages: string[]): string[] {
  const fullText = pages.join(" ");
  const words = fullText.split(/\s+/).filter(Boolean);
  const segments: string[] = [];

  for (let i = 0; i < words.length; i += SEGMENT_WORD_LIMIT) {
    segments.push(words.slice(i, i + SEGMENT_WORD_LIMIT).join(" "));
  }

  return segments;
}

// generateSlug — creates a URL-safe slug from a book title
export function generateSlug(title: string, author: string): string {
  const base = `${title} ${author}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  // Append a short random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}

// cn — utility for merging Tailwind class names
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// getBillingPeriodStart — returns first day of current month (for Vapi usage tracking)
export function getBillingPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
