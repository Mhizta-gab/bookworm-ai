import { NextRequest, NextResponse } from "next/server";

// GET  /api/books/[slug]/comments — fetch comments for a book
// POST /api/books/[slug]/comments — create a new comment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // TODO: Fetch comments from MongoDB
  return NextResponse.json({ comments: [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // TODO: Create a comment
  return NextResponse.json({ comment: null }, { status: 201 });
}
