"use client";

import { useState } from "react";
import { AudioLines, ArrowLeft, ArrowRight, FileText, Mic, UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import styles from "@/components/dashboard/dashboard.module.css";
import { uploadChecklist } from "@/components/dashboard/mock-data";
import { VOICE_PERSONAS } from "@/lib/constants";

const steps = [
  { id: "file", label: "Book file", note: "Start with the PDF" },
  { id: "details", label: "Book details", note: "Give it context" },
  { id: "voice", label: "Voice persona", note: "Choose how it speaks" },
  { id: "review", label: "Review", note: "Confirm the setup" },
] as const;

export default function NewBookPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const activePersona = VOICE_PERSONAS[0];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <>
      <PageHeader
        eyebrow="Upload"
        title="Add a book without the clutter"
        description="This flow stays narrow on purpose. You only see one decision at a time, so adding a new book feels calm instead of administrative."
      />

      <section className={styles.uploadWizardLayout}>
        <aside className={styles.uploadRail}>
          <div className={styles.uploadRailHeader}>
            <p className={styles.panelLabel}>Setup flow</p>
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
              {uploadChecklist.slice(0, 3).map((step) => (
                <div key={step} className={styles.uploadMiniRow}>
                  <span className={styles.uploadMiniDot} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <article className={styles.uploadModal}>
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
                <div className={styles.uploadDropzone}>
                  <div className={styles.stack}>
                    <div className={styles.smallIconWrap}>
                      <UploadCloud size={18} />
                    </div>
                    <strong>Drop your PDF here</strong>
                    <p className={styles.bookMeta}>Supports up to 50MB. We will parse the text, chapters, and searchable passages.</p>
                  </div>
                </div>

                <div className={styles.uploadHintCard}>
                  <div className={styles.uploadHintIcon}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <strong>Keep this step simple</strong>
                    <p className={styles.bookMeta}>Only the main PDF is required right now. Cover art and other polish can come later.</p>
                  </div>
                </div>
              </div>
            ) : null}

            {stepIndex === 1 ? (
              <div className={styles.uploadStepPanel}>
                <div className={styles.uploadFields}>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Book title</span>
                    <input className={styles.fieldInput} defaultValue="Atomic Habits" />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Author</span>
                    <input className={styles.fieldInput} defaultValue="James Clear" />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Short description</span>
                    <textarea
                      className={styles.fieldTextarea}
                      defaultValue="A practical book on behavior change, identity, and building systems that last."
                    />
                  </label>
                </div>

                <div className={styles.uploadHintCard}>
                  <div className={styles.uploadHintIcon}>
                    <AudioLines size={16} />
                  </div>
                  <div>
                    <strong>Why these details matter</strong>
                    <p className={styles.bookMeta}>This context improves summaries, recommendations, and the way the voice assistant introduces the book.</p>
                  </div>
                </div>
              </div>
            ) : null}

            {stepIndex === 2 ? (
              <div className={styles.uploadStepPanel}>
                <div className={styles.personaGrid}>
                  {VOICE_PERSONAS.slice(0, 4).map((persona, index) => (
                    <button
                      key={persona.id}
                      type="button"
                      className={`${styles.personaCard} ${index === 0 ? styles.personaCardActive : ""}`}
                    >
                      <div className={styles.personaCardTop}>
                        <div>
                          <p className={styles.personaName}>{persona.name}</p>
                          <p className={styles.bookMeta}>
                            {persona.gender} • {persona.character}
                          </p>
                        </div>
                        <span className={styles.smallIconWrap}>
                          <Mic size={15} />
                        </span>
                      </div>
                      <p className={styles.bookMeta}>Best for {persona.bestFor.toLowerCase()}.</p>
                    </button>
                  ))}
                </div>

                <div className={styles.uploadHintCard}>
                  <div className={styles.uploadHintIcon}>
                    <Mic size={16} />
                  </div>
                  <div>
                    <strong>Start with one strong default</strong>
                    <p className={styles.bookMeta}>Readers can always change the voice later. What matters here is getting the first session live quickly.</p>
                  </div>
                </div>
              </div>
            ) : null}

            {stepIndex === 3 ? (
              <div className={styles.uploadStepPanel}>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewCard}>
                    <p className={styles.panelLabel}>File</p>
                    <strong>atomic-habits.pdf</strong>
                    <p className={styles.bookMeta}>Primary source ready for parsing and indexing</p>
                  </div>
                  <div className={styles.reviewCard}>
                    <p className={styles.panelLabel}>Book details</p>
                    <strong>Atomic Habits</strong>
                    <p className={styles.bookMeta}>James Clear • practical habits and behavior change</p>
                  </div>
                  <div className={styles.reviewCard}>
                    <p className={styles.panelLabel}>Voice</p>
                    <strong>{activePersona.name}</strong>
                    <p className={styles.bookMeta}>Prepared for grounded answers and chapter-level recall</p>
                  </div>
                </div>

                <div className={styles.uploadSummaryCard}>
                  <p className={styles.panelLabel}>After you confirm</p>
                  <div className={styles.stack}>
                    {uploadChecklist.map((step) => (
                      <div key={step} className={styles.uploadMiniRow}>
                        <span className={styles.uploadMiniDot} />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.uploadModalFooter}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={isFirstStep}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}
            >
              {isLastStep ? "Create book" : "Continue"}
              {!isLastStep ? <ArrowRight size={16} /> : null}
            </button>
          </div>
        </article>
      </section>
    </>
  );
}
