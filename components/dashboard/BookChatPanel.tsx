"use client";

import { FormEvent, useMemo, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import styles from "./dashboard.module.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type BookChatPanelProps = {
  bookId: string;
  bookTitle: string;
  starterPrompt: string;
};

export function BookChatPanel({ bookId, bookTitle, starterPrompt }: BookChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const prompts = useMemo(
    () => [
      starterPrompt,
      `Summarize the main idea of ${bookTitle}.`,
      "Give me three study questions from the strongest passages.",
    ],
    [bookTitle, starterPrompt]
  );

  async function submitMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isSubmitting) return;

    setError("");
    setInput("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/chat/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, message: trimmed }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to answer from this book.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.answer ?? "I could not answer from the retrieved passages." },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to answer from this book.";
      setError(message);
      setMessages((current) => [...current, { role: "assistant", content: message }]);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(input);
  }

  return (
    <article className={styles.transcriptCard}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.panelLabel}>Ask the book</p>
          <h3 className={styles.panelTitle}>Grounded text chat</h3>
        </div>
        <span className={styles.statusPill}>
          <Sparkles size={15} />
          OpenAI
        </span>
      </div>

      {messages.length ? (
        <div className={styles.chatMessageList}>
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`${styles.transcriptRow} ${message.role === "assistant" ? styles.transcriptAssistant : ""}`}
            >
              <div className={styles.transcriptBubble}>
                <div className={styles.transcriptRole}>{message.role === "assistant" ? "Bookworm" : "You"}</div>
                <div>{message.content}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.chatStarterGrid}>
          {prompts.map((prompt) => (
            <button key={prompt} type="button" className={styles.chatStarterButton} onClick={() => submitMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      {isSubmitting ? <p className={styles.bookMeta}>Searching the saved passages and composing an answer...</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <form className={styles.chatComposer} onSubmit={handleSubmit}>
        <input
          className={styles.chatInput}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question about this book"
          disabled={isSubmitting}
        />
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting || !input.trim()}>
          <Send size={16} />
          Ask
        </button>
      </form>
    </article>
  );
}
