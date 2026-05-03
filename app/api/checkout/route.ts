import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

// ---------------------------------------------------------------------------
// Plan → Stripe Price ID mapping
// Replace these with your REAL Price IDs from the Stripe Dashboard
// (Products > your product > Add price → copy "price_xxx")
// ---------------------------------------------------------------------------
const PLAN_PRICE_IDS: Record<string, string> = {
  "capsulas-a1": "price_REPLACE_CAPSULAS_A1",
  "cursos-b1-cornelia": "price_REPLACE_CURSOS_B1",
  mentorship: "price_REPLACE_MENTORSHIP",
}

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("[Super Teacher] STRIPE_SECRET_KEY no está configurado en .env.local")
  }
  return new Stripe(secretKey, { apiVersion: "2025-04-30.basil" })
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const plan = searchParams.get("plan")

  // --- Validar plan ---
  if (!plan || !(plan in PLAN_PRICE_IDS)) {
    return NextResponse.json(
      { error: `Plan desconocido: "${plan}". Opciones: ${Object.keys(PLAN_PRICE_IDS).join(", ")}` },
      { status: 400 }
    )
  }

  // --- Obtener email del usuario logueado en Supabase ---
  const supabase = await createClient()
  let customerEmail: string | undefined

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    customerEmail = user?.email ?? undefined
  }

  // --- Crear sesión de Stripe Checkout ---
  let stripe: Stripe
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json(
      { error: "Stripe no está configurado. Contacta con el administrador." },
      { status: 503 }
    )
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: PLAN_PRICE_IDS[plan],
        quantity: 1,
      },
    ],
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    metadata: {
      plan,
    },
  })

  // Stripe devuelve la URL de pago — redirigimos al usuario
  return NextResponse.redirect(session.url!, 303)
}
