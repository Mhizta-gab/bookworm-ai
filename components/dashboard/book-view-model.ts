import type { IBook } from "@/types";
import type { DashboardBook } from "./mock-data";

const accents = [
  "linear-gradient(135deg, #86a8ff 0%, #cdd8ff 100%)",
  "linear-gradient(135deg, #ffd15c 0%, #fff1bf 100%)",
  "linear-gradient(135deg, #ff9478 0%, #ffd4c5 100%)",
  "linear-gradient(135deg, #85d7b2 0%, #d9f5e8 100%)",
] as const;

function formatUpdatedLabel(value?: string) {
  if (!value) return "Recently added";

  const updatedAt = new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor((Date.now() - updatedAt) / 60000));

  if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Updated ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `Updated ${diffDays}d ago`;
}

export function toDashboardBook(book: IBook, index = 0): DashboardBook {
  const isReady = book.totalSegments > 0;
  const status = isReady ? "Ready" : "Processing";
  const hasPdf = Boolean(book.fileUrl);
  const passageLabel = `${book.totalSegments.toLocaleString()} ${book.totalSegments === 1 ? "passage" : "passages"}`;

  return {
    id: book._id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    persona: book.persona,
    genre: "Uploaded book",
    status,
    sessions: 0,
    minutes: 0,
    highlights: 0,
    summary: isReady
      ? `${passageLabel} are ready for questions, notes, and voice reading.`
      : "This book has been added and Bookworm is still preparing it for questions.",
    progress: isReady ? 100 : 35,
    lastPrompt: `Give me a concise overview of ${book.title}, then suggest the first three questions I should ask.`,
    updatedLabel: formatUpdatedLabel(book.updatedAt),
    updateSummary: isReady
      ? `${passageLabel} ready. ${hasPdf ? "The original PDF is saved with this book." : "The readable parts are ready for conversation."}`
      : "Bookworm is preparing the book and will unlock the full conversation soon.",
    accent: accents[index % accents.length],
    coverUrl: book.coverUrl,
    fileUrl: book.fileUrl,
    totalSegments: book.totalSegments,
    fileSize: book.fileSize,
    isUploaded: true,
  };
}

export function toDashboardBooks(books: IBook[]) {
  return books.map(toDashboardBook);
}
