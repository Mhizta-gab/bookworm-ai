"use client";

import { useState, useTransition, useRef } from "react";
import { Heart, Trash2, MessageSquare, Send, CornerDownRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
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
  bookId: string;
  onReplyAdded?: (reply: CommentData, parentId: string) => void;
  isReply?: boolean;
}

function CommentItem({ comment, currentUserId, bookId, onReplyAdded, isReply = false }: CommentItemProps) {
  const [likes, setLikes] = useState(comment.likes.length);
  const [liked, setLiked] = useState(comment.likes.includes(currentUserId ?? ""));
  const [isDeleting, startDelete] = useTransition();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyError, setReplyError] = useState("");
  const [isSubmittingReply, startReplyTransition] = useTransition();

  async function handleLike() {
    if (!currentUserId || comment._id.startsWith("temp-")) return;
    setLiked((p) => !p);
    setLikes((p) => (liked ? p - 1 : p + 1));
    await toggleLike(comment._id);
  }

  async function handleDelete() {
    if (comment._id.startsWith("temp-")) return;
    startDelete(async () => {
      await deleteComment(comment._id);
    });
  }

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyDraft.trim()) return;
    setReplyError("");

    const optimisticReply: CommentData = {
      _id: `temp-${Date.now()}`,
      bookId,
      clerkId: currentUserId ?? "",
      authorName: "You",
      authorImageUrl: "",
      content: replyDraft.trim(),
      likes: [],
      createdAt: new Date().toISOString(),
      parentId: comment._id,
    };

    if (onReplyAdded) {
      onReplyAdded(optimisticReply, comment._id);
    }

    const draftText = replyDraft.trim();
    setReplyDraft("");
    setShowReplyForm(false);

    startReplyTransition(async () => {
      const result = await createComment(bookId, draftText, comment._id);
      if (!result.success) {
        setReplyError(result.error ?? "Failed to post reply.");
      }
    });
  }

  return (
    <div className={styles.commentCard} style={{ opacity: isDeleting ? 0.5 : 1, marginBottom: isReply ? 8 : 12 }}>
      <div className={styles.commentRow}>
        <Link 
          href={`/dashboard/profile/${comment.clerkId}`} 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10,
            textDecoration: "none",
            color: "inherit"
          }}
        >
          {comment.authorImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.authorImageUrl}
              alt=""
              style={{ width: isReply ? 26 : 30, height: isReply ? 26 : 30, borderRadius: "50%", border: "2px solid rgba(24,23,23,0.1)" }}
            />
          ) : (
            <div
              style={{
                width: isReply ? 26 : 30, height: isReply ? 26 : 30, borderRadius: "50%",
                background: "#8293ff", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontSize: "0.78rem", fontWeight: 800,
              }}
            >
              {comment.authorName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <strong style={{ fontSize: isReply ? "0.86rem" : "0.92rem" }} className={styles.commentAuthorName}>{comment.authorName}</strong>
            <p className={styles.commentMeta}>{timeAgo(comment.createdAt)}</p>
          </div>
        </Link>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
            disabled={comment._id.startsWith("temp-")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              border: "none", background: "transparent", 
              cursor: (currentUserId && !comment._id.startsWith("temp-")) ? "pointer" : "default",
              color: liked ? "#d68422" : "#5c554d", fontWeight: 700, fontSize: "0.82rem",
              opacity: comment._id.startsWith("temp-") ? 0.6 : 1,
            }}
          >
            <Heart size={14} fill={liked ? "currentColor" : "none"} />
            {likes > 0 && likes}
          </button>

          {!isReply && currentUserId && (
            <button
              type="button"
              onClick={() => setShowReplyForm(!showReplyForm)}
              aria-label="Reply to comment"
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                border: "none", background: "transparent", cursor: "pointer",
                color: "#5c554d", fontWeight: 700, fontSize: "0.82rem"
              }}
            >
              <CornerDownRight size={13} />
              Reply
            </button>
          )}

          {comment.clerkId === currentUserId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || comment._id.startsWith("temp-")}
              aria-label="Delete comment"
              className={styles.limitBannerDismiss}
              style={{
                cursor: comment._id.startsWith("temp-") ? "default" : "pointer",
                opacity: comment._id.startsWith("temp-") ? 0.6 : 1,
              }}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      <p style={{ margin: "8px 0 0", lineHeight: 1.6, fontSize: isReply ? "0.9rem" : "0.95rem" }}>{comment.content}</p>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} style={{ marginTop: 10, paddingLeft: 12, borderLeft: "2px solid #d68422" }}>
          <div className={styles.chatComposer} style={{ minHeight: 38 }}>
            <textarea
              className={styles.chatInput}
              placeholder={`Replying to ${comment.authorName}…`}
              rows={1}
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReplySubmit(e as any); }
              }}
              maxLength={1200}
              style={{ resize: "none", paddingTop: 8, paddingBottom: 8, fontSize: "0.88rem" }}
            />
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmittingReply || !replyDraft.trim()}
              aria-label="Post reply"
              style={{ minWidth: 36, padding: "0 10px" }}
            >
              <Send size={14} />
            </button>
          </div>
          {replyError && <p className={styles.errorText} style={{ marginTop: 4, fontSize: "0.8rem" }}>{replyError}</p>}
        </form>
      )}

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 12, paddingLeft: 16, borderLeft: "2px solid rgba(24,23,23,0.08)" }}>
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              currentUserId={currentUserId} 
              bookId={bookId}
              isReply={true}
            />
          ))}
        </div>
      )}
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

  function handleReplyAdded(newReply: CommentData, parentId: string) {
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      })
    );
  }

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
      replies: [],
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
            <CommentItem 
              key={c._id} 
              comment={c} 
              currentUserId={userId} 
              bookId={bookId}
              onReplyAdded={handleReplyAdded}
            />
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

