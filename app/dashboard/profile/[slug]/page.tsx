import { AudioLines, BookOpen, Heart, Users } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import styles from "@/components/dashboard/dashboard.module.css";
import { dashboardBooks, profileSnapshot } from "@/components/dashboard/mock-data";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const uploadedBooks = dashboardBooks.slice(0, 3);

  return (
    <>
      <section className={styles.profileHero}>
        <PageHeader
          eyebrow="Profile"
          title={profileSnapshot.name}
          description={`${profileSnapshot.handle} • ${profileSnapshot.role}`}
          actions={
            <>
              <button type="button" className={styles.secondaryButton}>
                Follow
              </button>
              <Link href="/dashboard/library" className={styles.primaryButton}>
                Browse library
              </Link>
            </>
          }
        />
        <p>{profileSnapshot.bio}</p>
        <div className={styles.heroStrip}>
          <span className={styles.tinyPill}>
            <Users size={14} />
            {profileSnapshot.followers} followers
          </span>
          <span className={styles.tinyPill}>
            <Heart size={14} />
            {profileSnapshot.following} following
          </span>
          <span className={styles.tinyPill}>
            <AudioLines size={14} />
            {profileSnapshot.sessionsThisMonth} sessions this month
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
              {profileSnapshot.favoriteGenres.map((genre) => (
                <span key={genre} className={styles.tinyPill}>
                  {genre}
                </span>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelLabel}>This month</p>
                <h3 className={styles.panelTitle}>Reading rhythm</h3>
              </div>
            </div>
            <div className={styles.stack}>
              <div className={styles.statRow}>
                <div className={styles.smallIconWrap}>
                  <BookOpen size={15} />
                </div>
                <div>
                  <strong>{uploadedBooks.length} active books</strong>
                  <p className={styles.bookMeta}>Across upload, review, and listening</p>
                </div>
              </div>
              <div className={styles.statRow}>
                <div className={styles.smallIconWrap}>
                  <AudioLines size={15} />
                </div>
                <div>
                  <strong>Voice-first learner</strong>
                  <p className={styles.bookMeta}>Most conversations start with a chapter recap</p>
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
              {uploadedBooks.map((book) => (
                <article key={book.id} className={styles.bookCard}>
                  <div className={styles.bookCover} style={{ background: book.accent }}>
                    <div className={styles.bookCoverTop}>
                      <span className={styles.accentPill}>{book.status}</span>
                      <span className={styles.tinyPill}>{book.persona}</span>
                    </div>
                    <div>
                      <h2 className={styles.bookTitle}>{book.title}</h2>
                      <p className={styles.bookMeta}>{book.author}</p>
                    </div>
                  </div>
                  <div className={styles.bookActions}>
                    <Link href={`/dashboard/books/${book.slug}`} className={styles.microButton}>
                      Open
                    </Link>
                    <button type="button" className={styles.ghostButton}>
                      Share
                    </button>
                  </div>
                </article>
              ))}
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
        <p className={styles.bookMeta}>This public profile belongs to <strong>{slug}</strong>.</p>
      </article>
    </>
  );
}
