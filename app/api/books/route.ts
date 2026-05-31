import { NextRequest, NextResponse } from "next/server";
import { getAllBooks } from "@/lib/actions/book.actions";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") ?? undefined;
  const books = await getAllBooks({ query });

  return NextResponse.json({ books, total: books.length });
}
