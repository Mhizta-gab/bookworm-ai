import styles from "@/app/page.module.css";

export function DarkBanner() {
  return (
    <section className={styles.darkBanner}>
      <div className={styles.container}>
        <h2>Stop skimming, start understanding</h2>
        <p>Upload a book once and return to it anytime through voice.</p>
      </div>
    </section>
  );
}
