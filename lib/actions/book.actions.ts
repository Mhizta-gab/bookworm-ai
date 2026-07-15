"use server";

import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/database/mongoose";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";
import VoiceSession from "@/database/models/voice-session.model";
import { generateSlug } from "@/lib/utils";
import type { IBook } from "@/types";

type CreateBookInput = {
  title: string;
  author: string;
  persona: string;
  isPublic?: boolean;
  fileUrl?: string;
  fileBlobKey?: string;
  coverUrl?: string;
  coverBlobKey?: string;
  fileSize?: number;
};

type BookQuery = {
  query?: string;
  ownerOnly?: boolean;
};

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDatabaseErrorMessage(error: unknown) {
  if (
    error instanceof Error &&
    (error.message.includes("bad auth") || error.message.includes("authentication failed"))
  ) {
    return "MongoDB authentication failed. Check the database user's username/password in MONGODB_URI, then restart the dev server.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Database request failed.";
}

export async function createBook(data: CreateBookInput) {
  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in to create a book." };
    }

    const existing = await Book.findOne({
      clerkId: userId,
      title: new RegExp(`^${escapeRegex(data.title.trim())}$`, "i"),
      author: new RegExp(`^${escapeRegex(data.author.trim())}$`, "i"),
    }).lean();

    if (existing) {
      const shouldReplaceDefaultCover = data.coverUrl && (!existing.coverUrl || existing.coverUrl === "/book-3d.png");
      const shouldAddPdf = data.fileUrl && !existing.fileUrl;

      if (shouldReplaceDefaultCover || shouldAddPdf) {
        const updated = await Book.findByIdAndUpdate(
          existing._id,
          {
            ...(shouldReplaceDefaultCover
              ? { coverUrl: data.coverUrl, coverBlobKey: data.coverBlobKey }
              : {}),
            ...(shouldAddPdf ? { fileUrl: data.fileUrl, fileBlobKey: data.fileBlobKey } : {}),
          },
          { new: true }
        ).lean();

        return { success: true, alreadyExists: true, data: serialize(updated) as unknown as IBook };
      }

      return { success: true, alreadyExists: true, data: serialize(existing) as unknown as IBook };
    }

    const book = await Book.create({
      clerkId: userId,
      title: data.title.trim(),
      author: data.author.trim(),
      slug: generateSlug(data.title, data.author),
      persona: data.persona,
      isPublic: data.isPublic ?? true,
      fileUrl: data.fileUrl,
      fileBlobKey: data.fileBlobKey,
      coverUrl: data.coverUrl ?? "/book-3d.png",
      coverBlobKey: data.coverBlobKey,
      fileSize: data.fileSize ?? 0,
      totalSegments: 0,
    });

    return { success: true, data: serialize(book) as unknown as IBook };
  } catch (error) {
    console.error("Failed to create book:", error);
    return { success: false, error: getDatabaseErrorMessage(error) };
  }
}

export async function saveBookSegments(bookId: string, segments: string[]) {
  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in to save book segments." };
    }

    const book = await Book.findOne({ _id: bookId, clerkId: userId }).select("_id").lean();
    if (!book) {
      return { success: false, error: "Book not found." };
    }

    if (!segments.length) return { success: true, segmentsCreated: 0 };

    const docs = segments.map((content, segmentIndex) => ({
      clerkId: userId,
      bookId,
      content,
      segmentIndex,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    }));

    await BookSegment.insertMany(docs, { ordered: true });
    await Book.findByIdAndUpdate(bookId, { totalSegments: docs.length });

    return { success: true, segmentsCreated: docs.length };
  } catch (error) {
    console.error("Failed to save book segments:", error);
    return { success: false, error: getDatabaseErrorMessage(error) };
  }
}

export async function checkBookExists(slug: string) {
  await connectDB();
  const existing = await Book.findOne({ slug }).lean();
  return existing ? (serialize(existing) as unknown as IBook) : null;
}

export async function getAllBooks(options: BookQuery = {}) {
  await connectDB();
  const { userId } = await auth();
  const filter: Record<string, unknown> = {};

  // ownerOnly defaults to true (my library), pass false for public library
  if (options.ownerOnly !== false) {
    if (!userId) return [];
    filter.clerkId = userId;
  }

  if (options.query?.trim()) {
    const regex = new RegExp(escapeRegex(options.query.trim()), "i");
    filter.$or = [{ title: regex }, { author: regex }];
  }

  const books = await Book.find(filter).sort({ updatedAt: -1 }).lean();
  return serialize(books) as unknown as IBook[];
}

export type BookWithStats = IBook & { sessionCount: number; readerCount: number };

export async function getAllBooksPublic(query?: string): Promise<BookWithStats[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};

  if (query?.trim()) {
    const regex = new RegExp(escapeRegex(query.trim()), "i");
    filter.$or = [{ title: regex }, { author: regex }];
  }

  const books = await Book.find(filter).sort({ updatedAt: -1 }).lean() as unknown as IBook[];
  if (!books.length) return [];

  const bookIds = books.map((b) => b._id);

  // Count sessions and unique readers per book
  const sessionAgg = await VoiceSession.aggregate<{ _id: string; sessions: number; readers: number }>([
    { $match: { bookId: { $in: bookIds } } },
    {
      $group: {
        _id: "$bookId",
        sessions: { $sum: 1 },
        readers: { $addToSet: "$clerkId" },
      },
    },
    { $project: { sessions: 1, readers: { $size: "$readers" } } },
  ]);

  const statsMap = new Map(
    sessionAgg.map((s) => [String(s._id), { sessionCount: s.sessions, readerCount: s.readers }])
  );

  // Deduplicate by title + author (case-insensitive)
  // Pick the copy with the most segments as canonical; aggregate all stats
  const deduped = new Map<string, BookWithStats>();

  for (const book of books) {
    const key = `${book.title.trim().toLowerCase()}__${book.author.trim().toLowerCase()}`;
    const stats = statsMap.get(String(book._id)) ?? { sessionCount: 0, readerCount: 0 };

    if (!deduped.has(key)) {
      deduped.set(key, { ...book, ...stats });
    } else {
      const existing = deduped.get(key)!;
      const merged = {
        sessionCount: existing.sessionCount + stats.sessionCount,
        readerCount: existing.readerCount + stats.readerCount,
      };
      // Prefer the copy with more segments (better processed)
      if (book.totalSegments > existing.totalSegments) {
        deduped.set(key, { ...book, ...merged });
      } else {
        deduped.set(key, { ...existing, ...merged });
      }
    }
  }

  return serialize(Array.from(deduped.values())) as unknown as BookWithStats[];
}

export async function getBookBySlug(slug: string) {
  await connectDB();
  // Books are public — no clerkId filter. Anyone can view any book detail page.
  const book = await Book.findOne({ slug }).lean();
  return book ? (serialize(book) as unknown as IBook) : null;
}

export async function getBookById(bookId: string) {
  await connectDB();
  const book = await Book.findById(bookId).lean();
  return book ? (serialize(book) as unknown as IBook) : null;
}

export async function searchBookSegments(bookId: string, query: string, limit = 3) {
  await connectDB();

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  let segments = await BookSegment.find(
    { bookId, $text: { $search: trimmedQuery } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean()
    .catch(() => []);

  if (!segments.length) {
    const keywords = trimmedQuery
      .split(/\s+/)
      .map(escapeRegex)
      .filter((word) => word.length > 2)
      .join("|");

    if (keywords) {
      segments = await BookSegment.find({
        bookId,
        content: { $regex: keywords, $options: "i" },
      })
        .sort({ segmentIndex: 1 })
        .limit(limit)
        .lean();
    }
  }

  return serialize(segments);
}


export async function updateBookVisibility(bookId: string, isPublic: boolean) {
  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const updated = await Book.findOneAndUpdate(
      { _id: bookId, clerkId: userId },
      { isPublic },
      { new: true }
    ).lean();

    if (!updated) {
      return { success: false, error: "Book not found or unauthorized." };
    }

    return { success: true, data: serialize(updated) as unknown as IBook };
  } catch (error) {
    return { success: false, error: getDatabaseErrorMessage(error) };
  }
}
