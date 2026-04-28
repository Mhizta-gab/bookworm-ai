import styles from "@/app/page.module.css";
import { testimonialCards } from "./content";
import { SectionHeader } from "./shared";

export function TestimonialsSection() {
  return (
    <section className={styles.testimonialsSection} id="testimonials">
      <div className={styles.container}>
        <SectionHeader title="Readers are loving Bookworm AI!" />
        <div className={styles.testimonialGrid}>
          {testimonialCards.map((card) => (
            <article key={card.brand} className={styles.testimonialCard}>
              <h3>{card.brand}</h3>
              <p>{card.text}</p>
              <div className={styles.testimonialFooter}>
                <span className={styles.userChip} />
                <div>
                  <strong>{card.name}</strong>
                  <small>{card.role}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
