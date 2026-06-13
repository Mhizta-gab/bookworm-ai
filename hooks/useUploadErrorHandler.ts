"use client";

import { showToast, pdfErrors } from "@/lib/toast";

export interface UploadError {
  code: string;
  message: string;
  details?: string;
}

/**
 * Hook for handling file upload errors with toast notifications
 */
export function useUploadErrorHandler() {
  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      const message = error.message;

      // Check for specific error patterns
      if (message.includes("PDF") || message.includes("pdf")) {
        if (message.includes("invalid") || message.includes("format")) {
          showToast.error(
            pdfErrors.INVALID_FORMAT,
            pdfErrors.INVALID_FORMAT_DESC
          );
        } else if (message.includes("corrupted")) {
          showToast.error(
            pdfErrors.CORRUPTED_FILE,
            pdfErrors.CORRUPTED_FILE_DESC
          );
        } else if (message.includes("large") || message.includes("size")) {
          showToast.error(
            pdfErrors.TOO_LARGE,
            pdfErrors.TOO_LARGE_DESC
          );
        } else if (message.includes("extract") || message.includes("content")) {
          showToast.error(
            pdfErrors.EXTRACTION_FAILED,
            pdfErrors.EXTRACTION_FAILED_DESC
          );
        } else if (message.includes("empty")) {
          showToast.error(
            pdfErrors.NO_CONTENT,
            pdfErrors.NO_CONTENT_DESC
          );
        } else {
          showToast.error(
            pdfErrors.UPLOAD_FAILED,
            message
          );
        }
      } else if (message.includes("Unauthorized")) {
        showToast.error(
          "Authentication Error",
          "Please sign in to upload files."
        );
      } else if (message.includes("Unauthorized")) {
        showToast.error(
          "File Error",
          message
        );
      } else {
        showToast.error(
          pdfErrors.UPLOAD_FAILED,
          message
        );
      }
    } else {
      showToast.error(
        pdfErrors.UPLOAD_FAILED,
        "An unexpected error occurred."
      );
    }
  };

  return { handleError };
}
