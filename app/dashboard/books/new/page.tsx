"use client";

import { useMemo, useState } from "react";
import { AudioLines, ArrowLeft, ArrowRight, CheckCircle2, FileText, ImagePlus, Mic, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import styles from "@/components/dashboard/dashboard.module.css";
import { uploadChecklist } from "@/components/dashboard/mock-data";
import { MAX_COVER_SIZE_MB, MAX_PDF_SIZE_MB, type PersonaId, VOICE_PERSONAS } from "@/lib/constants";
import { createBook, saveBookSegments } from "@/lib/actions/book.actions";
import { createPdfCoverFile, parsePDF, splitIntoSegments } from "@/lib/utils";

const steps = [
  { id: "file", label: "Choose book", note: "Start with your PDF" },
  { id: "details", label: "Book details", note: "Give it context" },
  { id: "voice", label: "Reading voice", note: "Choose how it sounds" },
  { id: "review", label: "Review", note: "Confirm the setup" },
] as const;

type UploadResult = {
  url: string;
  publicId: string;
  bytes: number;
};

async function uploadMedia(file: File, kind: "cover" | "pdf"): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Upload failed.");
  }

  return payload as UploadResult;
}

export default function NewBookPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [keepPdf, setKeepPdf] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [persona, setPersona] = useState<PersonaId>(VOICE_PERSONAS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");

  const activePersona = useMemo(
    () => VOICE_PERSONAS.find((item) => item.id === persona) ?? VOICE_PERSONAS[0],
    [persona]
  );

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const canContinue =
    stepIndex === 0
      ? !!pdfFile
      : stepIndex === 1
        ? title.trim().length > 0 && author.trim().length > 0
        : true;

  function handlePdfChange(file: File | null) {
    if (!file) {
      setPdfFile(null);
      setPdfProgress(0);
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
      toast.error(`PDF must be ${MAX_PDF_SIZE_MB}MB or smaller.`);
      return;
    }

    setPdfFile(file);
    setPdfProgress(10);
    setTimeout(() => setPdfProgress(45), 150);
    setTimeout(() => setPdfProgress(85), 300);
    setTimeout(() => setPdfProgress(100), 450);

    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "));
    }
  }

  function handleCoverChange(file: File | null) {
    if (!file) return setCoverFile(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Cover must be JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_COVER_SIZE_MB * 1024 * 1024) {
      toast.error(`Cover must be ${MAX_COVER_SIZE_MB}MB or smaller.`);
      return;
    }

    setCoverFile(file);
  }

  async function submitBook() {
    if (!pdfFile || !title.trim() || !author.trim()) {
      toast.error("Add the PDF, title, and author before creating the book.");
      return;
    }

    setIsSubmitting(true);

    try {
      setStatusText("Preparing your book for questions...");
      const pages = await parsePDF(pdfFile);
      const segments = splitIntoSegments(pages);

      if (!segments.length) {
        throw new Error("No readable text was found in this PDF.");
      }

      let coverUpload: UploadResult | null = null;
      let pdfUpload: UploadResult | null = null;

      setStatusText(coverFile ? "Saving your cover image..." : "Creating a cover from the first page...");
      const coverToUpload = coverFile ?? (await createPdfCoverFile(pdfFile));
      setStatusText("Saving your cover image...");
      coverUpload = await uploadMedia(coverToUpload, "cover");

      if (keepPdf) {
        setStatusText("Keeping a copy of the original PDF...");
        pdfUpload = await uploadMedia(pdfFile, "pdf");
      }

      setStatusText("Adding the book to your library...");
      const bookResult = await createBook({
        title,
        author,
        persona,
        coverUrl: coverUpload?.url,
        coverBlobKey: coverUpload?.publicId,
        fileUrl: pdfUpload?.url,
        fileBlobKey: pdfUpload?.publicId,
        fileSize: pdfFile.size,
      });

      if (!bookResult.success || !bookResult.data) {
        throw new Error(bookResult.error ?? "Failed to create book.");
      }

      if (bookResult.alreadyExists) {
        toast.info("That book is already in your library. I opened it for you.");
        router.push(`/dashboard/books/${bookResult.data.slug}`);
        return;
      }

      setStatusText("Making the book ready for conversation...");
      const segmentResult = await saveBookSegments(bookResult.data._id, segments);

      if (!segmentResult.success) {
        throw new Error(segmentResult.error ?? "Failed to finish preparing this book.");
      }

      toast.success("Book created.");
      router.push(`/dashboard/books/${bookResult.data.slug}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create book.");
    } finally {
      setIsSubmitting(false);
      setStatusText("");
    }
  }

  function continueFlow() {
    if (!canContinue) {
      toast.error(stepIndex === 0 ? "Upload a PDF to continue." : "Add the title and author to continue.");
      return;
    }

    if (isLastStep) {
      void submitBook();
      return;
    }

    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  }

  return (
    <>
      <PageHeader
        eyebrow="Upload"
        title="Add a book without the clutter"
        description="Choose a PDF, add the details, pick a reading voice, and Bookworm will make it ready for questions."
      />

      <section className={styles.uploadWizardLayout}>
        <aside className={styles.uploadRail}>
          <div className={styles.uploadRailHeader}>
            <p className={styles.panelLabel}>Reading setup</p>
            <h3 className={styles.panelTitle}>Create a talking book</h3>
          </div>

          <div className={styles.uploadStepList}>
            {steps.map((step, index) => {
              const state =
                index === stepIndex ? styles.uploadStepActive : index < stepIndex ? styles.uploadStepDone : "";

              return (
                <button
                  key={step.id}
                  type="button"
                  className={`${styles.uploadStepItem} ${state}`}
                  onClick={() => setStepIndex(index)}
                  disabled={isSubmitting}
                >
                  <span className={styles.uploadStepNumber}>0{index + 1}</span>
                  <span>
                    <strong>{step.label}</strong>
                    <span className={styles.uploadStepNote}>{step.note}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.uploadChecklistCard}>
            <p className={styles.panelLabel}>What happens next</p>
            <div className={styles.stack}>
              {uploadChecklist.map((step) => (
                <div key={step} className={styles.uploadMiniRow}>
                  <span className={styles.uploadMiniDot} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <article className={styles.uploadModal} style={{ position: "relative" }}>
          {isSubmitting && (
            <div className={styles.uploadProcessingOverlay}>
              <div className={styles.uploadSpinner} />
              <h2 className={styles.pageHeaderTitle} style={{ marginBottom: 10 }}>Processing Book</h2>
              <p className={styles.bookMeta} style={{ fontSize: "1.1rem", fontWeight: 700, color: "#181717", maxWidth: 420 }}>
                {statusText || "Preparing your book for AI interaction..."}
              </p>
            </div>
          )}

          <div className={styles.uploadModalHeader}>
            <div>
              <p className={styles.panelLabel}>
                Step {stepIndex + 1} of {steps.length}
              </p>
              <h2 className={styles.pageHeaderTitle}>{steps[stepIndex].label}</h2>
            </div>
            <div className={styles.uploadProgressPill}>{Math.round(((stepIndex + 1) / steps.length) * 100)}% ready</div>
          </div>

          <div className={styles.uploadProgressTrack}>
            <span className={styles.uploadProgressBar} style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
          </div>

          <div className={styles.uploadModalBody}>
            {stepIndex === 0 ? (
              <div className={styles.uploadStepPanel}>
                {!pdfFile ? (
                  <label className={styles.uploadDropzone}>
                    <input
                      className={styles.fileInput}
                      type="file"
                      accept="application/pdf"
                      disabled={isSubmitting}
                      onChange={(event) => handlePdfChange(event.target.files?.[0] ?? null)}
                    />
                    <div className={styles.stack}>
                      <div className={styles.smallIconWrap}>
                        <UploadCloud size={18} />
                      </div>
                      <strong>Choose your PDF</strong>
                      <p className={styles.bookMeta}>Required. Bookworm reads the file so you can ask questions later.</p>
                    </div>
                  </label>
                ) : (
                  <div className={styles.fileProgressCard}>
                    <div className={styles.fileProgressHeader}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className={styles.smallIconWrap} style={{ background: "#8293ff", color: "#fff" }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <strong>{pdfFile.name}</strong>
                          <p className={styles.bookMeta} style={{ margin: 0 }}>
                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePdfChange(null)}
                        className={styles.limitBannerDismiss}
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.84rem", fontWeight: 800 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, color: pdfProgress === 100 ? "#2e7d32" : "#181717" }}>
                        {pdfProgress === 100 ? <CheckCircle2 size={15} /> : null}
                        {pdfProgress === 100 ? "PDF Ready for setup" : "Processing PDF..."}
                      </span>
                      <span>{pdfProgress}%</span>
                    </div>

                    <div className={styles.fileProgressBarTrack}>
                      <div className={styles.fileProgressBarFill} style={{ width: `${pdfProgress}%` }} />
                    </div>
                  </div>
                )}

                <label className={styles.uploadDropzone} style={{ minHeight: pdfFile ? 140 : 232 }}>
                  <input
                    className={styles.fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isSubmitting}
                    onChange={(event) => handleCoverChange(event.target.files?.[0] ?? null)}
                  />
                  <div className={styles.stack}>
                    <div className={styles.smallIconWrap}>
                      <ImagePlus size={18} />
                    </div>
                    <strong>{coverFile ? coverFile.name : "Add cover image"}</strong>
                    <p className={styles.bookMeta}>Optional. A clear cover makes your library easier to scan.</p>
                  </div>
                </label>

                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={keepPdf}
                    disabled={isSubmitting}
                    onChange={(event) => setKeepPdf(event.target.checked)}
                  />
                  <span>Keep a copy of the original PDF</span>
                </label>
              </div>
            ) : null}

            {stepIndex === 1 ? (
              <div className={styles.uploadStepPanel}>
                <div className={styles.uploadFields}>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Book title</span>
                    <input className={styles.fieldInput} value={title} disabled={isSubmitting} onChange={(event) => setTitle(event.target.value)} />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Author</span>
                    <input className={styles.fieldInput} value={author} disabled={isSubmitting} onChange={(event) => setAuthor(event.target.value)} />
                  </label>
                </div>

                <div className={styles.uploadHintCard}>
                  <div className={styles.uploadHintIcon}>
                    <AudioLines size={16} />
                  </div>
                  <div>
                    <strong>Why these details matter</strong>
                    <p className={styles.bookMeta}>These details help Bookworm answer with the right title, author, and tone.</p>
                  </div>
                </div>
              </div>
            ) : null}

            {stepIndex === 2 ? (
              <div className={styles.uploadStepPanel}>
                <div className={styles.personaGrid}>
                  {VOICE_PERSONAS.map((voice) => (
                    <button
                      key={voice.id}
                      type="button"
                      className={`${styles.personaCard} ${voice.id === persona ? styles.personaCardActive : ""}`}
                      onClick={() => setPersona(voice.id)}
                      disabled={isSubmitting}
                    >
                      <div className={styles.personaCardTop}>
                        <div>
                          <p className={styles.personaName}>{voice.name}</p>
                          <p className={styles.bookMeta}>
                            {voice.gender} - {voice.character}
                          </p>
                        </div>
                        <span className={styles.smallIconWrap}>
                          <Mic size={15} />
                        </span>
                      </div>
                      <p className={styles.bookMeta}>Best for {voice.bestFor.toLowerCase()}.</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {stepIndex === 3 ? (
              <div className={styles.uploadStepPanel}>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewCard}>
                    <p className={styles.panelLabel}>File</p>
                    <strong>{pdfFile?.name ?? "No PDF selected"}</strong>
                    <p className={styles.bookMeta}>{keepPdf ? "A copy of the PDF will stay with this book." : "Bookworm will remember the readable parts needed for questions."}</p>
                  </div>
                  <div className={styles.reviewCard}>
                    <p className={styles.panelLabel}>Book details</p>
                    <strong>{title || "Untitled"}</strong>
                    <p className={styles.bookMeta}>{author || "Unknown author"}</p>
                  </div>
                  <div className={styles.reviewCard}>
                    <p className={styles.panelLabel}>Voice</p>
                    <strong>{activePersona.name}</strong>
                    <p className={styles.bookMeta}>Prepared for grounded answers and chapter-level recall</p>
                  </div>
                  <div className={styles.reviewCard}>
                    <p className={styles.panelLabel}>Cover</p>
                    <strong>{coverFile ? "Custom cover" : "Cover from first page"}</strong>
                    <p className={styles.bookMeta}>{coverFile?.name ?? "First PDF page will be saved as the cover"}</p>
                  </div>
                </div>

                {statusText ? (
                  <div className={styles.uploadSummaryCard}>
                    <p className={styles.panelLabel}>Working</p>
                    <strong>{statusText}</strong>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className={styles.uploadModalFooter}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={isFirstStep || isSubmitting}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button type="button" className={styles.primaryButton} onClick={continueFlow} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : isLastStep ? "Add book" : "Continue"}
              {!isLastStep ? <ArrowRight size={16} /> : null}
            </button>
          </div>
        </article>
      </section>
    </>
  );
}
