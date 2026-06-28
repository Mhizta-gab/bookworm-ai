"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import styles from "@/components/dashboard/dashboard.module.css";
import { Check, Share2, UserPlus } from "lucide-react";
import { toggleFollow } from "@/lib/actions/user.actions";

interface ProfileActionsProps {
  isOwner: boolean;
  targetUserId: string;
  initialIsFollowing: boolean;
  onFollowToggle?: (newCount: number, isFollowing: boolean) => void;
}

export function ProfileActions({ isOwner, targetUserId, initialIsFollowing, onFollowToggle }: ProfileActionsProps) {
  const [following, setFollowing] = useState(initialIsFollowing);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    const nextState = !following;
    setFollowing(nextState);
    startTransition(async () => {
      const res = await toggleFollow(targetUserId);
      if (res.success && res.followersCount !== undefined && res.isFollowing !== undefined) {
        setFollowing(res.isFollowing);
        if (onFollowToggle) {
          onFollowToggle(res.followersCount, res.isFollowing);
        }
      } else {
        setFollowing(!nextState); // rollback on error
      }
    });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", width: "100%", flexWrap: "wrap" }}>
      {!isOwner && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleFollow}
          className={following ? styles.primaryButton : styles.secondaryButton}
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "6px",
            minWidth: "120px",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {following ? (
            <>
              <Check size={15} />
              Following
            </>
          ) : (
            <>
              <UserPlus size={15} />
              Follow
            </>
          )}
        </button>
      )}

      <button
        type="button"
        onClick={handleShare}
        className={styles.secondaryButton}
        style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "6px",
          minWidth: "130px" 
        }}
      >
        <Share2 size={15} />
        {copied ? "Copied Link!" : "Share Profile"}
      </button>

      <Link href="/dashboard/library" className={styles.primaryButton} style={{ textDecoration: "none", textAlign: "center" }}>
        Browse Library
      </Link>
    </div>
  );
}

