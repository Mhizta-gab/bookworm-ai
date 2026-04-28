import { NextRequest, NextResponse } from "next/server";

// POST /api/upload
// Handles authenticated PDF and cover image uploads to Cloudinary
export async function POST(req: NextRequest) {
  // TODO: Implement Cloudinary upload handler
  return NextResponse.json({ message: "Upload endpoint — coming soon" }, { status: 501 });
}
