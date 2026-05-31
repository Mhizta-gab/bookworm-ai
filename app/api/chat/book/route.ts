import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBookById, searchBookSegments } from "@/lib/actions/book.actions";

const OPENAI_MODEL = "gpt-4.1-mini";

function extractResponseText(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "output_text" in payload &&
    typeof payload.output_text === "string"
  ) {
    return payload.output_text;
  }

  const output = payload && typeof payload === "object" && "output" in payload ? payload.output : null;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) {
        return [];
      }

      return item.content
        .map((contentItem) => {
          if (
            contentItem &&
            typeof contentItem === "object" &&
            "text" in contentItem &&
            typeof contentItem.text === "string"
          ) {
            return contentItem.text;
          }

          return "";
        })
        .filter(Boolean);
    })
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
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

    const segments = await searchBookSegments(bookId, message, 5);
    const context = segments
      .map((segment, index) => `Passage ${index + 1}:\n${segment.content}`)
      .join("\n\n---\n\n");

    if (!context) {
      return NextResponse.json({
        answer: "I could not find matching passages in this book yet. Try asking with a more specific phrase from the text.",
        sources: [],
      });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: "system",
            content:
              "You are Bookworm AI. Answer only from the provided book passages. If the passages do not contain enough evidence, say what is missing. Be clear, conversational, and useful. Do not invent page numbers or facts.",
          },
          {
            role: "user",
            content: `Book: ${book.title} by ${book.author}\n\nRetrieved passages:\n${context}\n\nQuestion: ${message}`,
          },
        ],
        max_output_tokens: 700,
      }),
    });

    const payload = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI chat failed:", payload);
      return NextResponse.json({ error: "OpenAI request failed." }, { status: 500 });
    }

    return NextResponse.json({
      answer: extractResponseText(payload) || "I could not produce an answer from the retrieved passages.",
      sources: segments.map((segment) => ({
        id: String(segment._id),
        segmentIndex: segment.segmentIndex,
        preview: segment.content.slice(0, 220),
      })),
    });
  } catch (error) {
    console.error("Book chat failed:", error);
    return NextResponse.json({ error: "Failed to answer from this book." }, { status: 500 });
  }
}
