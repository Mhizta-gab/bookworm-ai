import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/mongoose";
import Book from "@/database/models/book.model";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  try {
    const { transcript, currentBookTitle, currentBookAuthor } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "No transcript provided." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ recommendations: [] });
    }

    // Fetch library book titles for grounding
    await connectDB();
    const books = await Book.find({}).select("title author").limit(60).lean();
    const libraryList = books
      .filter((b) => b.title.toLowerCase() !== currentBookTitle?.toLowerCase())
      .map((b) => `"${b.title}" by ${b.author}`)
      .join(", ");

    const prompt = `You are a knowledgeable reading advisor for Bookworm AI.

A user just finished a voice conversation about "${currentBookTitle}" by ${currentBookAuthor}.

Conversation summary:
---
${transcript.slice(0, 1800)}
---

Available books in the community library: ${libraryList || "none yet"}

Based on the topics, questions, and themes discussed, recommend exactly 3 books.
Prefer books from the library list when relevant. You may also suggest books not in the list.

Respond ONLY with a valid JSON array of exactly 3 objects, no markdown fences, no explanation:
[
  { "title": "...", "author": "...", "reason": "one sentence why", "inLibrary": true },
  { "title": "...", "author": "...", "reason": "one sentence why", "inLibrary": false },
  { "title": "...", "author": "...", "reason": "one sentence why", "inLibrary": false }
]`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
        }),
      }
    );

    const payload = await geminiResponse.json();
    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let recommendations: unknown[] = [];
    try {
      recommendations = JSON.parse(cleaned);
    } catch {
      recommendations = [];
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("[recommend]", error);
    return NextResponse.json({ recommendations: [] });
  }
}
