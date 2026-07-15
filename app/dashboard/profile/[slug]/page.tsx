import { AudioLines, BookOpen, Heart, Users } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BookLibraryCard } from "@/components/dashboard/BookLibraryCard";
import styles from "@/components/dashboard/dashboard.module.css";
import { getUserProfile } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { EditBio } from "@/components/dashboard/EditBio";
import { ProfileActions } from "@/components/dashboard/ProfileActions";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const profile = await getUserProfile(decodedSlug);
  const { userId: loggedInUserId } = await auth();

  if (!profile) {
    return (
      <div
        className={styles.stack}
        style={{
          padding: "80px 24px",
          textAlign: "center",
          alignItems: "center",
          gap: "24px"
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "850", marginBottom: "8px" }}>Reader Not Found</h1>
          <p style={{ color: "#5c554d", fontSize: "1.1rem" }}>
            We couldn't find a reader profile matching "@{decodedSlug}".
          </p>
        </div>
        <Link href="/dashboard/library" className={styles.primaryButton} style={{ textDecoration: "none" }}>
          Go to Library
        </Link>
      </div>
    );
  }

  const isOwner = loggedInUserId === profile.id;

  return (
    <>
      <section className={styles.profileHero}>
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "20px" }}>
          {profile.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.imageUrl}
              alt={profile.name}
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                border: "2px solid #181717",
                boxShadow: "4px 4px 0 #181717",
                objectFit: "cover"
              }}
            />
          ) : (
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                border: "2px solid #181717",
                background: "#8293ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                color: "#ffffff",
                fontWeight: "bold",
                boxShadow: "4px 4px 0 #181717"
              }}
            >
              {profile.name[0]}
            </div>
          )}
          <div style={{ flex: 1, minWidth: "250px" }}>
            <PageHeader
              eyebrow="Profile"
              title={profile.name}
              description={`@${profile.cleanHandle}`}
              actions={<ProfileActions isOwner={isOwner} targetUserId={profile.id} initialIsFollowing={profile.isFollowing} />}
            />
          </div>
        </div>

        <EditBio initialBio={profile.bio} isOwner={isOwner} />

        <div className={styles.heroStrip} style={{ marginTop: "16px" }}>
          <span className={styles.tinyPill}>
            <Users size={14} />
            {profile.followersCount} {profile.followersCount === 1 ? "follower" : "followers"}
          </span>
          <span className={styles.tinyPill}>
            <Heart size={14} />
            {profile.followingCount} following
          </span>
          <span className={styles.tinyPill}>
            <AudioLines size={14} />
            {profile.totalSessions} sessions ({profile.totalMinutes}m spoken)
          </span>
        </div>
      </section>

      <section className={styles.profileColumns}>
        <div className={styles.profileSidebar}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelLabel}>Reading identity</p>
                <h3 className={styles.panelTitle}>Favorite genres</h3>
              </div>
            </div>
            <div className={styles.genreList}>
              {profile.favoriteGenres.map((genre) => (
                <span key={genre} className={styles.tinyPill}>
                  {genre}
                </span>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelLabel}>Stats</p>
                <h3 className={styles.panelTitle}>Reading rhythm</h3>
              </div>
            </div>
            <div className={styles.stack}>
              <div className={styles.statRow}>
                <div className={styles.smallIconWrap}>
                  <BookOpen size={15} />
                </div>
                <div>
                  <strong>{profile.uploadedBooks.length} active books</strong>
                  <p className={styles.bookMeta}>In their personal library</p>
                </div>
              </div>
              <div className={styles.statRow}>
                <div className={styles.smallIconWrap}>
                  <AudioLines size={15} />
                </div>
                <div>
                  <strong>Voice-first learner</strong>
                  <p className={styles.bookMeta}>Prefers voice-interactive chapter study</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className={styles.stack}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelLabel}>Uploaded books</p>
                <h3 className={styles.panelTitle}>Personal library</h3>
              </div>
            </div>
            <div className={styles.bookGrid}>
              {profile.uploadedBooks.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#5c554d", width: "100%" }}>
                  <p>This user hasn't uploaded any books to their personal library yet.</p>
                </div>
              ) : (
                profile.uploadedBooks.map((book) => (
                  <BookLibraryCard key={book.id} book={book as any} />
                ))
              )}
            </div>
          </article>
        </div>
      </section>

      <article className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.panelLabel}>Handle</p>
            <h3 className={styles.panelTitle}>Public reader handle</h3>
          </div>
        </div>
        <p className={styles.bookMeta}>This public profile belongs to <strong>@{profile.cleanHandle}</strong>.</p>
      </article>
    </>
  );
}
