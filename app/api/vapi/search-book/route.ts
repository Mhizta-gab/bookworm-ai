import { NextRequest, NextResponse } from "next/server";

// POST /api/vapi/search-book
// CRITICAL: This is the Vapi tool call handler.
// Vapi calls this endpoint during every voice session when the AI needs book content.
// Must be publicly accessible (deployed on Vercel or exposed via ngrok locally).
//
// Request body: { bookId: string, query: string }
// Response:     { result: string }  ← top 3 relevant segments joined as a single string
export async function POST(req: NextRequest) {
  // TODO: Implement MongoDB text search across BookSegment.content
  return NextResponse.json({ result: "search-book endpoint — coming soon" }, { status: 501 });
}
