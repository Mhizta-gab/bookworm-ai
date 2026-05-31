import { NextRequest, NextResponse } from "next/server";
import { searchBookSegments } from "@/lib/actions/book.actions";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bookId = typeof body?.bookId === "string" ? body.bookId : "";
    const query = typeof body?.query === "string" ? body.query : "";

    if (!bookId || !query.trim()) {
      return NextResponse.json({ result: "Missing bookId or query." }, { status: 400 });
    }

    const segments = await searchBookSegments(bookId, query, 3);

    if (!segments.length) {
      return NextResponse.json({ result: "No matching information was found in this book." });
    }

    return NextResponse.json({
      result: segments.map((segment) => segment.content).join("\n\n"),
    });
  } catch (error) {
    console.error("Vapi book search failed:", error);
    return NextResponse.json({ result: "Error searching this book." }, { status: 500 });
  }
}
