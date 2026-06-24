import { PricingTable } from "@clerk/nextjs";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import styles from "@/components/dashboard/dashboard.module.css";
import { getVoiceUsage } from "@/lib/actions/subscription.actions";

function pct(used: number, limit: number) {
  if (limit === 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export const metadata = {
  title: "Billing — Bookworm AI",
  description: "Manage your plan and track monthly voice session usage.",
};

export default async function BillingPage() {
  const { sessionsUsed, minutesUsed, limits, plan } = await getVoiceUsage();

  const sessionPct = pct(sessionsUsed, limits.monthlySessions);
  const minutePct = pct(minutesUsed, limits.monthlyMinutes);
  const sessionRemaining = Math.max(0, limits.monthlySessions - sessionsUsed);
  const minuteRemaining = Math.max(0, limits.monthlyMinutes - minutesUsed);

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Your plan"
        description="Track your monthly usage and choose the plan that fits how you read."
        actions={
          <span className={`${styles.planBadge} ${styles[`planBadge${planLabel}`]}`}>
            <CreditCard size={12} />
            {planLabel}
          </span>
        }
      />

      <div className={styles.billingLayout}>
        {/* ── Usage tiles ───────────────────────────────────────────────────── */}
        <div className={styles.billingUsageGrid}>
          <article className={styles.usageTile}>
            <div>
              <p className={styles.panelLabel}>Current plan</p>
              <h2 className={styles.panelTitle}>{planLabel}</h2>
            </div>
            <p className={styles.bookMeta}>
              {plan === "free"
                ? "You have access to 3 sessions and 30 minutes per month. Upgrade to unlock more."
                : plan === "standard"
                  ? "30 sessions and 600 minutes per month. Upgrade to Pro for the full experience."
                  : "Full access — 300 sessions and 3,000 minutes every month."}
            </p>
          </article>

          <article className={styles.usageTile}>
            <div>
              <p className={styles.panelLabel}>Sessions this month</p>
              <div className={styles.usageNumbers}>
                <span className={styles.usageCurrent}>{sessionsUsed}</span>
                <span className={styles.usageLimit}> / {limits.monthlySessions}</span>
              </div>
            </div>
            <div className={styles.usageBarTrack}>
              <div
                className={`${styles.usageBarFill} ${sessionPct >= 80 ? styles.usageBarFillWarning : ""}`}
                style={{ width: `${sessionPct}%` }}
              />
            </div>
            <p className={styles.bookMeta}>
              {sessionRemaining === 0
                ? "You've used all sessions for this period."
                : `${sessionRemaining} session${sessionRemaining === 1 ? "" : "s"} remaining.`}
            </p>
          </article>

          <article className={styles.usageTile}>
            <div>
              <p className={styles.panelLabel}>Minutes this month</p>
              <div className={styles.usageNumbers}>
                <span className={styles.usageCurrent}>{minutesUsed}</span>
                <span className={styles.usageLimit}> / {limits.monthlyMinutes} min</span>
              </div>
            </div>
            <div className={styles.usageBarTrack}>
              <div
                className={`${styles.usageBarFill} ${minutePct >= 80 ? styles.usageBarFillWarning : ""}`}
                style={{ width: `${minutePct}%` }}
              />
            </div>
            <p className={styles.bookMeta}>
              {minuteRemaining === 0
                ? "Monthly minute limit reached."
                : `${minuteRemaining} minute${minuteRemaining === 1 ? "" : "s"} remaining.`}
            </p>
          </article>
        </div>

        {/* ── Pricing table ────────────────────────────────────────────────── */}
        <section className={styles.pricingTableWrap}>
          <div>
            <p className={styles.panelLabel}>Plans</p>
            <h2 className={styles.panelTitle}>Choose your plan</h2>
            <p className={styles.bookMeta} style={{ marginTop: 6 }}>
              Upgrade or downgrade at any time. Upgrades take effect immediately.
            </p>
          </div>
          <PricingTable />
        </section>
      </div>
    </>
  );
}
