import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { courseId } = await req.json();

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, price, slug, thumbnail_url")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();

  if (!course || course.price <= 0) {
    return NextResponse.json({ error: "Curso no encontrado o es gratuito" }, { status: 400 });
  }

  // Check not already enrolled
  const { data: existing } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Ya estás inscrito" }, { status: 400 });
  }

  // Check membership for discount
  const { data: profile } = await supabase
    .from("profiles")
    .select("membership")
    .eq("id", user.id)
    .single();

  // TODO: apply member pricing if profile.membership !== 'free'
  const priceInCents = Math.round(course.price * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: "eur",
        product_data: {
          name: course.title,
          images: course.thumbnail_url ? [course.thumbnail_url] : [],
        },
        unit_amount: priceInCents,
      },
      quantity: 1,
    }],
    metadata: {
      course_id: course.id,
      user_id: user.id,
      type: "course_purchase",
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/academia/${course.slug}/aprender?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/academia/${course.slug}?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
