// BookCard component — displays book cover, title, and author in the library grid
import Link from "next/link";
import { IBook } from "@/types";

interface BookCardProps {
  book: IBook;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.slug}`}>
      {/* TODO: Implement BookCard UI */}
      <div>{book.title}</div>
    </Link>
  );
}
