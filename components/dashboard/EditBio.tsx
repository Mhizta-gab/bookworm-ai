"use client";

import { useState } from "react";
import { updateUserBio } from "@/lib/actions/user.actions";
import styles from "@/components/dashboard/dashboard.module.css";
import { Edit2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditBioProps {
  initialBio: string;
  isOwner: boolean;
}

export function EditBio({ initialBio, isOwner }: EditBioProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOwner) {
    return <p className={styles.profileBioText}>{initialBio || "This reader hasn't written a bio yet."}</p>;
  }

  const handleSave = async () => {
    setLoading(true);
    const res = await updateUserBio(bio);
    setLoading(false);
    if (res.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert(res.error || "Failed to update bio");
    }
  };

  if (isEditing) {
    return (
      <div className={styles.editBioContainer}>
        <textarea
          className={styles.bioTextarea}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about your reading style..."
          maxLength={250}
        />
        <div className={styles.editBioActions}>
          <button
            onClick={handleSave}
            disabled={loading}
            className={styles.primaryButton}
            style={{ padding: "6px 12px", fontSize: "13px", width: "auto" }}
          >
            <Save size={14} style={{ marginRight: "4.5px" }} />
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => {
              setBio(initialBio);
              setIsEditing(false);
            }}
            disabled={loading}
            className={styles.secondaryButton}
            style={{ padding: "6px 12px", fontSize: "13px", width: "auto" }}
          >
            <X size={14} style={{ marginRight: "4.5px" }} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bioDisplayRow}>
      <p className={styles.profileBioText}>{bio || "No bio yet. Click edit to add one!"}</p>
      <button
        onClick={() => setIsEditing(true)}
        className={styles.microButton}
        style={{ display: "inline-flex", alignItems: "center", gap: "4px", width: "auto" }}
      >
        <Edit2 size={12} />
        Edit Bio
      </button>
    </div>
  );
}
