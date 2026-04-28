import { NextRequest, NextResponse } from "next/server";

// GET /api/books/[slug]
// Returns a single book document with metadata.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // TODO: Fetch book by slug from MongoDB
  return NextResponse.json({ book: null });
}
