import { SEGMENT_OVERLAP_WORDS, SEGMENT_WORD_LIMIT } from "@/lib/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

type PdfTextItem = {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
  hasEOL?: boolean;
};

function normalizeExtractedText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function itemY(item: PdfTextItem) {
  return Math.round((item.transform[5] ?? 0) * 10) / 10;
}

function itemX(item: PdfTextItem) {
  return item.transform[4] ?? 0;
}

function extractPageText(items: PdfTextItem[]) {
  const textItems = items
    .filter((item) => item.str.trim())
    .sort((a, b) => {
      const yDelta = itemY(b) - itemY(a);
      if (Math.abs(yDelta) > 2) return yDelta;
      return itemX(a) - itemX(b);
    });

  const lines: string[] = [];
  let currentLine: string[] = [];
  let previousY: number | null = null;

  for (const item of textItems) {
    const y = itemY(item);
    const startsNewLine = previousY !== null && Math.abs(y - previousY) > 2;

    if (startsNewLine && currentLine.length) {
      lines.push(currentLine.join(" "));
      currentLine = [];
    }

    currentLine.push(item.str);
    previousY = y;

    if (item.hasEOL && currentLine.length) {
      lines.push(currentLine.join(" "));
      currentLine = [];
      previousY = null;
    }
  }

  if (currentLine.length) {
    lines.push(currentLine.join(" "));
  }

  return normalizeExtractedText(lines.join("\n"));
}

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
  const document = await pdfjsLib.getDocument({
    data: arrayBuffer,
    stopAtErrors: false,
    disableFontFace: false,
  }).promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent({
        includeMarkedContent: true,
        disableNormalization: false,
      });
      const textItems: PdfTextItem[] = [];

      for (const item of textContent.items) {
        const candidate = item as Partial<PdfTextItem>;

        if (typeof candidate.str === "string" && Array.isArray(candidate.transform)) {
          textItems.push({
            str: candidate.str,
            transform: candidate.transform,
            width: candidate.width,
            height: candidate.height,
            hasEOL: candidate.hasEOL,
          });
        }
      }

      const pageText = extractPageText(textItems);

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
  overlapSize: number = SEGMENT_OVERLAP_WORDS
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
