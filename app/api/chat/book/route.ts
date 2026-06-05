import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBookById } from "@/lib/actions/book.actions";
import { connectDB } from "@/database/mongoose";
import BookSegment from "@/database/models/book-segment.model";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const body = await req.json();
    const bookId = typeof body?.bookId === "string" ? body.bookId : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!bookId || !message) {
      return NextResponse.json({ error: "Missing bookId or message." }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const book = await getBookById(bookId);

    if (!book || book.clerkId !== userId) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    await connectDB();
    const segments = await BookSegment.find({ bookId })
      .sort({ segmentIndex: 1 })
      .select("content")
      .lean();

    const fullBookText = segments.map((s) => s.content).join("\n");

    if (!fullBookText) {
      return NextResponse.json({
        answer: "I could not find matching passages in this book yet. Try asking with a more specific phrase from the text.",
        sources: [],
      });
    }

    const prompt = `User's Question: ${message}`;
    const systemInstruction = `You are Bookworm AI, the digital embodiment of the book "${book.title}" by ${book.author}.
You have complete knowledge of the book's text.
Answer the user's question based strictly and only on the following full text of the book.
Do not hallucinate, speculate, or mention information not found in the book. If the text does not contain the answer, say so honestly.
Be clear, conversational, and direct.
Format every answer in clean Markdown:
- Use short paragraphs with blank lines between ideas.
- Use numbered lists when giving steps, laws, questions, or sequences.
- Use bullet lists for grouped supporting points.
- Use bold only for important terms.
- Never return a long single paragraph.

--- FULL BOOK TEXT START ---
${fullBookText}
--- FULL BOOK TEXT END ---`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          }
        }),
      }
    );

    const payload = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini API chat failed:", payload);
      const detail =
        typeof payload?.error?.message === "string"
          ? payload.error.message
          : "Gemini API request failed.";

      return NextResponse.json(
        { error: `Gemini API request failed: ${detail}` },
        { status: geminiResponse.status >= 400 && geminiResponse.status < 500 ? 502 : 500 }
      );
    }

    const answer = payload.candidates?.[0]?.content?.parts?.[0]?.text || "I could not produce an answer.";

    return NextResponse.json({
      answer,
      sources: [],
    });
  } catch (error) {
    console.error("Book chat failed:", error);
    const message =
      error instanceof Error && error.message.includes("getaddrinfo")
        ? "Could not connect to MongoDB Atlas. Check your network/DNS access and try again."
        : "Failed to answer from this book.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
