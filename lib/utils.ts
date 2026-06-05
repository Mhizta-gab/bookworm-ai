import { SEGMENT_WORD_LIMIT } from "@/lib/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export async function parsePDF(file: File): Promise<string[]> {
  if (typeof window === "undefined") {
    throw new Error("PDF parsing must run in the browser.");
  }

  const pdfjsLib = await import("pdfjs-dist");

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const document = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item) => "str" in item)
        .map((item) => (item as { str: string }).str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (pageText) {
        pages.push(pageText);
      }
    }
  } finally {
    await document.destroy();
  }

  return pages;
}

export async function createPdfCoverFile(file: File): Promise<File> {
  if (typeof window === "undefined") {
    throw new Error("PDF cover generation must run in the browser.");
  }

  const pdfjsLib = await import("pdfjs-dist");

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const document = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  try {
    const firstPage = await document.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1.8 });
    const canvas = window.document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create a canvas for the PDF cover.");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await firstPage.render({ canvas, canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (value) resolve(value);
        else reject(new Error("Could not export PDF cover image."));
      }, "image/png");
    });

    const baseName = file.name.replace(/\.[^/.]+$/, "") || "book-cover";
    return new File([blob], `${baseName}-cover.png`, { type: "image/png" });
  } finally {
    await document.destroy();
  }
}

export function splitIntoSegments(
  pages: string[],
  segmentSize: number = SEGMENT_WORD_LIMIT,
  overlapSize: number = 50
): string[] {
  const fullText = pages.join("\n");
  const words = fullText.split(/\s+/).filter((word) => word.length > 0);
  const segments: string[] = [];

  if (segmentSize <= 0) {
    throw new Error("segmentSize must be greater than 0");
  }
  if (overlapSize < 0 || overlapSize >= segmentSize) {
    throw new Error("overlapSize must be >= 0 and < segmentSize");
  }

  let startIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + segmentSize, words.length);
    const segmentWords = words.slice(startIndex, endIndex);
    segments.push(segmentWords.join(" "));

    if (endIndex >= words.length) break;
    startIndex = endIndex - overlapSize;
  }

  return segments;
}

export function generateSlug(title: string, author: string): string {
  const base = `${title} ${author}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBillingPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
