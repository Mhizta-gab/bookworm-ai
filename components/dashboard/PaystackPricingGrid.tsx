"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "@/components/dashboard/dashboard.module.css";

interface PaystackPricingGridProps {
  currentPlan: string;
}

const tiers = [
  {
    id: "free",
    name: "Free Reader",
    price: "$0",
    subprice: "/month",
    description: "Ideal for trying out Bookworm AI voice conversations.",
    features: [
      "15 voice minutes per month",
      "3 interactive reading sessions",
      "Max 5 mins per session",
      "Personal book library",
    ],
  },
  {
    id: "standard",
    name: "Standard Learner",
    price: "$12",
    subprice: "/month (≈ ₦12,000)",
    description: "Great for regular readers and active students.",
    features: [
      "120 voice minutes per month",
      "15 interactive reading sessions",
      "Max 15 mins per session",
      "Full library analysis & memory",
    ],
  },
  {
    id: "pro",
    name: "Pro Power Reader",
    price: "$29",
    subprice: "/month (≈ ₦29,000)",
    description: "For heavy researchers, scholars, and power readers.",
    features: [
      "450 voice minutes per month",
      "45 interactive reading sessions",
      "Extended 30 mins per session",
      "Priority AI processing & response",
    ],
  },
];

export function PaystackPricingGrid({ currentPlan }: PaystackPricingGridProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");

  const handleSubscribe = async (planId: string) => {
    if (planId === "free" || planId === currentPlan) return;

    try {
      setLoadingPlan(planId);
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, currency }),
      });

      const data = await response.json();

      if (!response.ok || !data.authorization_url) {
        throw new Error(data.error || "Could not start checkout");
      }

      // Redirect to Paystack secure checkout
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast.error(err.message || "Something went wrong initializing Paystack payment.");
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      <div className={styles.currencyToggleRow}>
        <span className={styles.currencyLabel}>Billing Currency:</span>
        <div className={styles.currencyToggleWrap}>
          <button
            type="button"
            className={`${styles.currencyToggleBtn} ${currency === "NGN" ? styles.currencyToggleBtnActive : ""}`}
            onClick={() => setCurrency("NGN")}
          >
            🇳🇬 NGN (₦)
          </button>
          <button
            type="button"
            className={`${styles.currencyToggleBtn} ${currency === "USD" ? styles.currencyToggleBtnActive : ""}`}
            onClick={() => setCurrency("USD")}
          >
            🌐 USD ($)
          </button>
        </div>
      </div>

      <div className={styles.pricingGridCards}>
        {tiers.map((tier) => {
          const isCurrent = currentPlan === tier.id;
          const isLoading = loadingPlan === tier.id;

          const displayPrice =
            tier.id === "free"
              ? "$0"
              : currency === "USD"
                ? tier.id === "pro"
                  ? "$29"
                  : "$12"
                : tier.id === "pro"
                  ? "₦29,000"
                  : "₦12,000";

          const displaySubprice =
            tier.id === "free"
              ? "/month"
              : currency === "USD"
                ? "/month (US Dollars)"
                : "/month (Naira)";

          return (
            <div
              key={tier.id}
              className={`${styles.paystackCard} ${isCurrent ? styles.paystackCardActive : ""}`}
            >
              <div className={styles.paystackCardHeader}>
                <h3 className={styles.paystackCardTitle}>{tier.name}</h3>
                <div className={styles.paystackCardPrice}>
                  <span className={styles.priceAmount}>{displayPrice}</span>
                  <span className={styles.pricePeriod}>{displaySubprice}</span>
                </div>
                <p className={styles.paystackCardDesc}>{tier.description}</p>
              </div>

              <ul className={styles.paystackFeatureList}>
                {tier.features.map((feature, idx) => (
                  <li key={idx} className={styles.paystackFeatureItem}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isCurrent || isLoading || tier.id === "free"}
                onClick={() => handleSubscribe(tier.id)}
                className={`${styles.paystackBtn} ${isCurrent ? styles.paystackBtnCurrent : ""}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className={styles.spinner} /> Processing...
                  </>
                ) : isCurrent ? (
                  "Active Plan"
                ) : tier.id === "free" ? (
                  "Default Plan"
                ) : (
                  `Upgrade (${currency === "USD" ? "$" : "₦"})`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
