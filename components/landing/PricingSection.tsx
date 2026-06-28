import styles from "@/app/page.module.css";
import { pricingTiers } from "./content";
import { TryBookwormButton } from "./TryBookwormButton";

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
              {tier.cta === "Start reading" ? (
                <TryBookwormButton className={`${styles.pricingButton} ${tier.muted ? styles.pricingButtonMuted : ""}`}>
                  Start reading
                </TryBookwormButton>
              ) : (
                <a
                  href={tier.cta === "Upgrade" ? "/dashboard/billing" : "#"}
                  className={`${styles.pricingButton} ${tier.muted ? styles.pricingButtonMuted : ""}`}
                  aria-disabled={tier.muted}
                >
                  {tier.cta}
                </a>
              )}
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

