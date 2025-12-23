import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (!stripeClient) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(secret, { apiVersion: "2023-10-16" });
  }
  return stripeClient;
}

export function platformFeePercent(): number {
  const value = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? 8);
  return Number.isFinite(value) ? value : 8;
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
