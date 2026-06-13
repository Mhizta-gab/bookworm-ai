export type DashboardBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  persona: string;
  genre: string;
  status: "Ready" | "In Review" | "Processing";
  sessions: number;
  minutes: number;
  highlights: number;
  summary: string;
  progress: number;
  lastPrompt: string;
  updatedLabel: string;
  updateSummary: string;
  accent: string;
  coverUrl?: string;
  fileUrl?: string;
  totalSegments?: number;
  fileSize?: number;
  isUploaded?: boolean;
};

export const dashboardBooks: DashboardBook[] = [
  {
    id: "bk_1",
    slug: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    persona: "Daniel",
    genre: "Self-help",
    status: "Ready",
    sessions: 12,
    minutes: 84,
    highlights: 31,
    summary: "Small systems, repeated daily, compound into identity-level change.",
    progress: 78,
    lastPrompt: "What is the difference between goals and systems in chapter 1?",
    updatedLabel: "Updated 12m ago",
    updateSummary: "A new note from your last conversation is ready to revisit.",
    accent: "linear-gradient(135deg, #86a8ff 0%, #cdd8ff 100%)",
  },
  {
    id: "bk_2",
    slug: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    persona: "Marcus",
    genre: "Productivity",
    status: "Ready",
    sessions: 9,
    minutes: 61,
    highlights: 18,
    summary: "Attention is an asset. Protect it, train it, and your best work follows.",
    progress: 64,
    lastPrompt: "Give me a practical ritual for entering deep work quickly.",
    updatedLabel: "Updated 1h ago",
    updateSummary: "A fresh summary is ready to revisit before the next session.",
    accent: "linear-gradient(135deg, #ffd15c 0%, #fff1bf 100%)",
  },
  {
    id: "bk_3",
    slug: "thinking-fast-and-slow",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    persona: "Rachel",
    genre: "Psychology",
    status: "In Review",
    sessions: 6,
    minutes: 47,
    highlights: 25,
    summary: "System 1 is fast and intuitive. System 2 is deliberate, slow, and expensive.",
    progress: 49,
    lastPrompt: "Explain cognitive ease like I am revising for an exam.",
    updatedLabel: "Updated 3h ago",
    updateSummary: "Bookworm is still getting this title ready for deeper chapter questions.",
    accent: "linear-gradient(135deg, #ff9478 0%, #ffd4c5 100%)",
  },
  {
    id: "bk_4",
    slug: "meditations",
    title: "Meditations",
    author: "Marcus Aurelius",
    persona: "Aria",
    genre: "Philosophy",
    status: "Processing",
    sessions: 2,
    minutes: 14,
    highlights: 7,
    summary: "Discipline your inner life and outer noise loses its force.",
    progress: 18,
    lastPrompt: "Summarize the core stoic idea in book 2.",
    updatedLabel: "Updated just now",
    updateSummary: "Bookworm is still preparing this PDF and will unlock the full conversation soon.",
    accent: "linear-gradient(135deg, #85d7b2 0%, #d9f5e8 100%)",
  },
];

export const dashboardStats = [
  { label: "Books in library", value: "24", note: "+4 this week" },
  { label: "Voice sessions", value: "61", note: "8 active this month" },
  { label: "Highlights saved", value: "183", note: "Synced across books" },
  { label: "Study streak", value: "12 days", note: "Best streak this quarter" },
] as const;

export const activeSessions = [
  { title: "Atomic Habits", time: "14m", mode: "Voice recap", state: "Speaking" },
  { title: "Deep Work", time: "09m", mode: "Quick answer", state: "Listening" },
  { title: "Meditations", time: "Getting ready", mode: "Book setup", state: "Preparing" },
] as const;

export const uploadChecklist = [
  "Choose a PDF from your device",
  "Add a cover or let Bookworm create one",
  "Pick the reading voice you prefer",
  "Make the book ready for questions and notes",
] as const;

export const transcriptPreview = [
  { role: "You", text: "Explain the author’s argument about identity-based habits." },
  { role: "Bookworm", text: "The book argues that lasting change begins with identity, not outcomes alone." },
  { role: "You", text: "Turn that into three practical actions for tomorrow morning." },
  { role: "Bookworm", text: "Start with a visible cue, make the first action tiny, and track the repetition." },
] as const;

export const communityFeed = [
  { user: "Ada", action: "shared a highlight", target: "Deep Work", time: "12m ago" },
  { user: "Mina", action: "finished a voice session", target: "Atomic Habits", time: "48m ago" },
  { user: "Sam", action: "saved a summary", target: "Thinking, Fast and Slow", time: "2h ago" },
] as const;

export const recommendations = ["The Psychology of Money", "Essentialism", "Make Time"] as const;

export const profileSnapshot = {
  name: "Adeola Reader",
  handle: "@adeola-reader",
  role: "Lifelong learner • Product thinker",
  bio: "Building a library of books I can actually talk to, revise from, and revisit on the move.",
  followers: 248,
  following: 91,
  sessionsThisMonth: 18,
  favoriteGenres: ["Psychology", "Personal growth", "Philosophy", "Productivity"],
};

export function getBookBySlug(slug: string) {
  return dashboardBooks.find((book) => book.slug === slug) ?? dashboardBooks[0];
}
