import { NextResponse } from "next/server";
import { getBookBySlug } from "@/lib/actions/book.actions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return NextResponse.json({ book: null, error: "Book not found" }, { status: 404 });
  }

  return NextResponse.json({ book });
}
