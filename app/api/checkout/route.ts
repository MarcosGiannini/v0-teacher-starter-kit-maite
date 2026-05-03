import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

// ---------------------------------------------------------------------------
// Plan → Stripe Price ID mapping
// Pega aquí los Price IDs de tu Stripe Dashboard (modo test):
//   dashboard.stripe.com/test/products → tu producto → precio → copiar "price_xxx"
// ---------------------------------------------------------------------------
const PLAN_PRICE_IDS: Record<string, string> = {
  "capsulas-a1":        process.env.STRIPE_PRICE_CAPSULAS_A1        ?? "",
  "cursos-b1-cornelia": process.env.STRIPE_PRICE_CURSOS_B1_CORNELIA ?? "",
  mentorship:           process.env.STRIPE_PRICE_MENTORSHIP          ?? "",
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const plan = searchParams.get("plan")

  // --- 1. Validar plan ---
  if (!plan || !(plan in PLAN_PRICE_IDS)) {
    return NextResponse.json(
      { error: `Plan desconocido: "${plan}". Opciones: ${Object.keys(PLAN_PRICE_IDS).join(", ")}` },
      { status: 400 }
    )
  }

  // --- 2. Validar que el Price ID esté configurado (no placeholder vacío) ---
  const priceId = PLAN_PRICE_IDS[plan]
  if (!priceId) {
    console.error(
      `[Checkout] ❌ Price ID no configurado para el plan "${plan}". ` +
      `Añade STRIPE_PRICE_${plan.toUpperCase().replace(/-/g, "_")} en .env.local`
    )
    return NextResponse.json(
      { error: `El plan "${plan}" no tiene un precio configurado en el servidor.` },
      { status: 503 }
    )
  }

  // --- 3. Validar clave de Stripe ---
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.error("[Checkout] ❌ STRIPE_SECRET_KEY no está configurado en .env.local")
    return NextResponse.json(
      { error: "Stripe no está configurado. Contacta con el administrador." },
      { status: 503 }
    )
  }

  // --- 4. Obtener email del usuario logueado en Supabase ---
  const supabase = await createClient()
  let customerEmail: string | undefined

  if (supabase) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error("[Checkout] ⚠️  Error obteniendo usuario de Supabase:", userError.message)
    } else {
      console.log(`[Checkout] ✅ Usuario identificado: ${user?.email ?? "anónimo"}`)
      customerEmail = user?.email ?? undefined
    }
  } else {
    console.warn("[Checkout] ⚠️  Cliente Supabase no disponible, se procederá sin email.")
  }

  // --- 5. Crear sesión de Stripe Checkout ---
  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2025-04-30.basil" })

    console.log(`[Checkout] 🔄 Creando sesión para plan="${plan}", price="${priceId}", email="${customerEmail ?? "none"}"`)

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/pricing`,
      metadata: { plan },
    })

    console.log(`[Checkout] ✅ Sesión creada: ${session.id}`)
    return NextResponse.redirect(session.url!, 303)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Checkout] ❌ Error de Stripe:", message)
    return NextResponse.json(
      { error: `Error al crear la sesión de pago: ${message}` },
      { status: 500 }
    )
  }
}
