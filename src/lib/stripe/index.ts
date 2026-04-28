import Stripe from "stripe";

let _stripe: Stripe | null = null;

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    if (!_stripe) {
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-02-24.acacia",
        typescript: true,
      });
    }
    return Reflect.get(_stripe, prop, receiver);
  },
});

export const STRIPE_PRODUCTS = {
  membership_basic:    process.env.STRIPE_PRICE_BASIC    ?? "",
  membership_advanced: process.env.STRIPE_PRICE_ADVANCED ?? "",
} as const;

/**
 * Crea o recupera un Customer de Stripe para un usuario
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const existing = await stripe.customers.search({
    query: `metadata['supabase_user_id']:'${userId}'`,
    limit: 1,
  });

  if (existing.data.length > 0) return existing.data[0].id;

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { supabase_user_id: userId },
  });
  return customer.id;
}
