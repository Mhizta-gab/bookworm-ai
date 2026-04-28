import { NextRequest, NextResponse } from "next/server";

// POST /api/social/follow
// Follow or unfollow a user by clerkId.
export async function POST(req: NextRequest) {
  // TODO: Implement follow/unfollow logic
  return NextResponse.json({ message: "follow route — coming soon" }, { status: 501 });
}
