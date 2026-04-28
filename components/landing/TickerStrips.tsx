import styles from "@/app/page.module.css";
import { tickerRows } from "./content";
import { TickerBadge } from "./shared";

export function TickerStrips() {
  return (
    <div className={styles.tickers}>
      {tickerRows.map((row) => (
        <div key={row.tone} className={`${styles.tickerRow} ${styles[row.tone]}`}>
          <div className={styles.tickerTrack}>
            {row.items.concat(row.items).map((item, index) => (
              <TickerBadge key={`${item}-${index}`} text={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
