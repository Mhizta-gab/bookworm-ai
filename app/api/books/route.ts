import { NextRequest, NextResponse } from "next/server";

// GET /api/books
// Returns paginated list of all books, sorted newest first.
export async function GET(req: NextRequest) {
  // TODO: Implement paginated book listing from MongoDB
  return NextResponse.json({ books: [], total: 0 });
}
