import { toast } from "sonner";

export const showToast = {
  /**
   * Show a success message
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show an error message
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show an info message
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show a warning message
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show a loading message
   */
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
    });
  },

  /**
   * Show a promise-based toast (for async operations)
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

/**
 * Common error messages for PDF processing
 */
export const pdfErrors = {
  INVALID_FORMAT: "Invalid PDF format",
  INVALID_FORMAT_DESC: "The file you uploaded is not a valid PDF. Please check and try again.",
  CORRUPTED_FILE: "PDF file is corrupted",
  CORRUPTED_FILE_DESC: "The PDF file appears to be corrupted. Please try uploading a different file.",
  TOO_LARGE: "PDF file is too large",
  TOO_LARGE_DESC: "The PDF file exceeds the maximum size limit. Please upload a smaller file.",
  EXTRACTION_FAILED: "Failed to extract content from PDF",
  EXTRACTION_FAILED_DESC: "We couldn't process this PDF. It might be a scanned image or have complex formatting.",
  UPLOAD_FAILED: "Upload failed",
  UPLOAD_FAILED_DESC: "There was an error uploading your file. Please try again.",
  NO_CONTENT: "PDF appears to be empty",
  NO_CONTENT_DESC: "The PDF file doesn't contain any readable text.",
};
