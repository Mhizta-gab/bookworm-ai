import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { MAX_COVER_SIZE_MB, MAX_PDF_SIZE_MB } from "@/lib/constants";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const pdfTypes = new Set(["application/pdf"]);

type UploadKind = "cover" | "pdf";

function getUploadKind(value: FormDataEntryValue | null): UploadKind | null {
  return value === "cover" || value === "pdf" ? value : null;
}

function uploadBuffer({
  buffer,
  folder,
  filename,
  resourceType,
}: {
  buffer: Buffer;
  folder: string;
  filename: string;
  resourceType: "image" | "raw";
}) {
  const cloudinary = getCloudinary();

  return new Promise<{ secure_url: string; public_id: string; bytes: number }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename.replace(/\.[^/.]+$/, ""),
        resource_type: resourceType,
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
        });
      }
    );

    stream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const kind = getUploadKind(formData.get("kind"));

    if (!(file instanceof File) || !kind) {
      return NextResponse.json({ error: "Missing file or upload kind." }, { status: 400 });
    }

    const maxBytes = kind === "cover" ? MAX_COVER_SIZE_MB * 1024 * 1024 : MAX_PDF_SIZE_MB * 1024 * 1024;
    const allowedTypes = kind === "cover" ? imageTypes : pdfTypes;

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: kind === "cover" ? "Use a JPG, PNG, or WEBP cover." : "Use a PDF file." }, { status: 400 });
    }

    if (file.size > maxBytes) {
      return NextResponse.json({ error: `File must be ${kind === "cover" ? MAX_COVER_SIZE_MB : MAX_PDF_SIZE_MB}MB or smaller.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer({
      buffer,
      folder: kind === "cover" ? `bookworm/${userId}/covers` : `bookworm/${userId}/pdfs`,
      filename: file.name,
      resourceType: kind === "cover" ? "image" : "raw",
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed. Check your Cloudinary configuration and try again." }, { status: 500 });
  }
}
