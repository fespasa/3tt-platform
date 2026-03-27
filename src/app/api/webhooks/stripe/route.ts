import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig  = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature error" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { user_id, type, reference_id } = pi.metadata;

      await supabase.from("payments").update({ status: "completed" })
        .match({ stripe_payment_id: pi.id });

      // Si es un curso, crear matrícula
      if (type === "course" && user_id && reference_id) {
        await supabase.from("course_enrollments").upsert(
          { user_id, course_id: reference_id },
          { onConflict: "user_id,course_id" }
        );
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      // Buscar usuario por stripe_customer_id
      const { data: membership } = await supabase
        .from("user_memberships")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (membership && sub.status === "active") {
        await supabase.from("user_memberships").update({
          status: "active",
          stripe_subscription_id: sub.id,
          ends_at: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from("user_memberships").update({ status: "expired" })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
