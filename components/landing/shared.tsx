import { BookOpen } from "lucide-react";
import styles from "@/app/page.module.css";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={styles.brand}>
      <div className={styles.brandMark}>
        <BookOpen size={15} strokeWidth={2.2} />
      </div>
      <span className={light ? styles.brandTextLight : styles.brandText}>bookworm ai</span>
    </div>
  );
}

export function SectionHeader({ title, copy }: { title: string; copy?: string }) {
  return (
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

export function TickerBadge({ text }: { text: string }) {
  return (
    <span className={styles.tickerBadge}>
      <span className={styles.tickerDot} />
      {text}
    </span>
  );
}
