import styles from "@/app/page.module.css";
import { pricingTiers } from "./content";

export function PricingSection() {
  return (
    <section className={styles.pricingSection} id="pricing">
      <div className={styles.container}>
        <div className={styles.pricingGrid}>
          {pricingTiers.map((tier) => (
            <article key={tier.label} className={`${styles.pricingCard} ${styles[tier.accent]}`}>
              <h3>{tier.label}</h3>
              <div className={styles.pricingValue}>
                <span>{tier.price}</span>
                {tier.subprice ? <small>{tier.subprice}</small> : null}
              </div>
              <a href="#cta" className={`${styles.pricingButton} ${tier.muted ? styles.pricingButtonMuted : ""}`}>
                {tier.cta}
              </a>
              <ul className={styles.pricingList}>
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <span className={styles.listDot} />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
