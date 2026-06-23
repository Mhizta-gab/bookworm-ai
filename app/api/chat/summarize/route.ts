import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

type TranscriptInput = {
  role?: string;
  content?: string;
};

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
    const transcripts: TranscriptInput[] = Array.isArray(body?.transcripts) ? body.transcripts : [];

    if (transcripts.length === 0) {
      return NextResponse.json({ error: "No transcripts provided." }, { status: 400 });
    }

    const transcriptText = transcripts
      .map((transcript) => {
        const speaker = transcript.role === "user" ? "User" : "Bookworm";
        return `${speaker}: ${transcript.content ?? ""}`;
      })
      .join("\n");

    const prompt = `Please summarize the following conversation between a User and a digital Book AI (Bookworm).
Extract the key takeaways, any important study questions that were asked, and any profound quotes or insights.

Make the summary extremely actionable and concise.
Format in clean Markdown using bold text for emphasis and bullet points.

--- TRANSCRIPT START ---
${transcriptText}
--- TRANSCRIPT END ---`;

    const systemInstruction = `You are a world-class executive assistant and study partner. Your goal is to turn raw, rambling conversational transcripts into perfectly structured, high-signal study notes.`;

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
            temperature: 0.2,
            maxOutputTokens: 800,
          }
        }),
      }
    );

    const payload = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini summarize failed:", payload);
      const detail =
        typeof payload?.error?.message === "string"
          ? payload.error.message
          : "Gemini API request failed.";

      return NextResponse.json(
        { error: `Gemini API request failed: ${detail}` },
        { status: geminiResponse.status >= 400 && geminiResponse.status < 500 ? 502 : 500 }
      );
    }

    const summary = payload.candidates?.[0]?.content?.parts?.[0]?.text || "I could not produce a summary.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Transcript summarization failed:", error);
    return NextResponse.json({ error: "Failed to summarize transcript." }, { status: 500 });
  }
}
