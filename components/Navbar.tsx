// Navbar — displays logo, navigation links, and Clerk user avatar
import Link from "next/link";

export default function Navbar() {
  // TODO: Integrate Clerk UserButton and auth state
  return (
    <nav>
      <Link href="/">Bookworm AI</Link>
    </nav>
  );
}
