import styles from "./page.module.css";
import { DarkBanner } from "@/components/landing/DarkBanner";
import { LandingFooter } from "@/components/landing/Footer";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingNavbar } from "@/components/landing/Navbar";
import { PricingSection } from "@/components/landing/PricingSection";
import { RememberSection } from "@/components/landing/RememberSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { TickerStrips } from "@/components/landing/TickerStrips";
import { UnderstandSection } from "@/components/landing/UnderstandSection";
import { UploadSection } from "@/components/landing/UploadSection";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <LandingNavbar />
      <HeroSection />
      <TickerStrips />
      <UploadSection />
      <UnderstandSection />
      <RememberSection />
      <DarkBanner />
      <PricingSection />
      <TestimonialsSection />
      <FinalCtaSection />
      <LandingFooter />
    </main>
  );
}
