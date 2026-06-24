"use client";

import { useState, useTransition, useRef } from "react";
import { Heart, Trash2, MessageSquare, Send } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import styles from "@/components/dashboard/dashboard.module.css";
import {
  createComment,
  deleteComment,
  toggleLike,
  type CommentData,
} from "@/lib/actions/comment.actions";

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface CommentItemProps {
  comment: CommentData;
  currentUserId?: string | null;
}

function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const [likes, setLikes] = useState(comment.likes.length);
  const [liked, setLiked] = useState(comment.likes.includes(currentUserId ?? ""));
  const [isDeleting, startDelete] = useTransition();

  async function handleLike() {
    if (!currentUserId) return;
    setLiked((p) => !p);
    setLikes((p) => (liked ? p - 1 : p + 1));
    await toggleLike(comment._id);
  }

  async function handleDelete() {
    startDelete(async () => {
      await deleteComment(comment._id);
    });
  }

  return (
    <div className={styles.commentCard} style={{ opacity: isDeleting ? 0.5 : 1 }}>
      <div className={styles.commentRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {comment.authorImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.authorImageUrl}
              alt=""
              style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid rgba(24,23,23,0.1)" }}
            />
          ) : (
            <div
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "#8293ff", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontSize: "0.78rem", fontWeight: 800,
              }}
            >
              {comment.authorName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <strong style={{ fontSize: "0.92rem" }}>{comment.authorName}</strong>
            <p className={styles.commentMeta}>{timeAgo(comment.createdAt)}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              border: "none", background: "transparent", cursor: currentUserId ? "pointer" : "default",
              color: liked ? "#d68422" : "#5c554d", fontWeight: 700, fontSize: "0.82rem",
            }}
          >
            <Heart size={14} fill={liked ? "currentColor" : "none"} />
            {likes > 0 && likes}
          </button>

          {comment.clerkId === currentUserId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete comment"
              className={styles.limitBannerDismiss}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      <p style={{ margin: "10px 0 0", lineHeight: 1.6, fontSize: "0.95rem" }}>{comment.content}</p>
    </div>
  );
}

interface CommentsSectionProps {
  bookId: string;
  initialComments: CommentData[];
}

export function CommentsSection({ bookId, initialComments }: CommentsSectionProps) {
  const { userId, isSignedIn } = useAuth();
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setError("");

    const optimistic: CommentData = {
      _id: `temp-${Date.now()}`,
      bookId,
      clerkId: userId ?? "",
      authorName: "You",
      authorImageUrl: "",
      content: draft.trim(),
      likes: [],
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [optimistic, ...prev]);
    setDraft("");

    startTransition(async () => {
      const result = await createComment(bookId, optimistic.content);
      if (!result.success) {
        setError(result.error ?? "Failed to post comment.");
        setComments((prev) => prev.filter((c) => c._id !== optimistic._id));
      }
    });
  }

  return (
    <div className={styles.commentsComposer}>
      {/* ── Comment list ─────────────────────────────────────────────── */}
      {comments.length > 0 ? (
        <div className={styles.commentList}>
          {comments.map((c) => (
            <CommentItem key={c._id} comment={c} currentUserId={userId} />
          ))}
        </div>
      ) : (
        <div className={styles.transcriptEmpty} style={{ minHeight: 120 }}>
          <MessageSquare size={22} strokeWidth={1.8} style={{ color: "#d68422" }} />
          <p className={styles.bookMeta}>No comments yet. Be the first to share a thought.</p>
        </div>
      )}

      {/* ── Composer ─────────────────────────────────────────────────── */}
      {isSignedIn ? (
        <form onSubmit={handleSubmit}>
          <div className={styles.chatComposer}>
            <textarea
              ref={textareaRef}
              className={styles.chatInput}
              placeholder="Share a thought about this book…"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); }
              }}
              maxLength={1200}
              style={{ resize: "none", paddingTop: 10, paddingBottom: 10 }}
            />
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isPending || !draft.trim()}
              aria-label="Post comment"
              style={{ minWidth: 44, padding: "0 14px" }}
            >
              <Send size={16} />
            </button>
          </div>
          {error && <p className={styles.errorText} style={{ marginTop: 6 }}>{error}</p>}
        </form>
      ) : (
        <p className={styles.bookMeta} style={{ fontStyle: "italic" }}>
          Sign in to join the discussion.
        </p>
      )}
    </div>
  );
}
