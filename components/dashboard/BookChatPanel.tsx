"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
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

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function normalizeAssistantText(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\s+(?=\d+\.\s+)/g, "\n")
    .replace(/\s+(?=-\s+)/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderAssistantMessage(content: string) {
  const lines = normalizeAssistantText(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const orderedItems: string[] = [];
    const bulletItems: string[] = [];

    while (index < lines.length) {
      const match = lines[index].match(/^\d+\.\s+(.+)$/);
      if (!match) break;
      orderedItems.push(match[1]);
      index += 1;
    }

    if (orderedItems.length) {
      blocks.push(
        <ol key={`ordered-${index}`}>
          {orderedItems.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    while (index < lines.length) {
      const match = lines[index].match(/^-\s+(.+)$/);
      if (!match) break;
      bulletItems.push(match[1]);
      index += 1;
    }

    if (bulletItems.length) {
      blocks.push(
        <ul key={`bullet-${index}`}>
          {bulletItems.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    blocks.push(<p key={`paragraph-${index}`}>{renderInlineMarkdown(lines[index])}</p>);
    index += 1;
  }

  return <div className={styles.chatFormattedMessage}>{blocks}</div>;
}

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
        { role: "assistant", content: payload.answer ?? "I could not find a clear answer in this book." },
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
          <h3 className={styles.panelTitle}>Ask in writing</h3>
        </div>
        <span className={styles.statusPill}>
          <Sparkles size={15} />
          Bookworm
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
                {message.role === "assistant" ? renderAssistantMessage(message.content) : <div>{message.content}</div>}
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

      {isSubmitting ? <p className={styles.bookMeta}>Reading the book and writing an answer...</p> : null}
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
