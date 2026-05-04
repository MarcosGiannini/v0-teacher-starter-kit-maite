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

  // --- 3. Validar y sanear clave de Stripe ---
  const rawKey = process.env.STRIPE_SECRET_KEY
  if (!rawKey || rawKey.trim() === "") {
    console.error("[Checkout] STRIPE_SECRET_KEY no está configurado")
    return NextResponse.json(
      { error: "Stripe no está configurado. Contacta con el administrador." },
      { status: 503 }
    )
  }

  const secretKey = rawKey.trim()

  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    console.error("[Checkout] STRIPE_SECRET_KEY tiene formato inválido")
    return NextResponse.json(
      { error: "La clave de Stripe tiene un formato inválido." },
      { status: 503 }
    )
  }

  // --- 4. Obtener email e ID del usuario logueado en Supabase ---
  const supabase = await createClient()
  let customerEmail: string | undefined
  let userId: string | undefined

  if (supabase) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error("[Checkout] ⚠️  Error obteniendo usuario de Supabase:", userError.message)
    } else {
      customerEmail = user?.email ?? undefined
      userId = user?.id ?? undefined
    }
  } else {
    console.warn("[Checkout] ⚠️  Cliente Supabase no disponible, se procederá sin email.")
  }

  // --- 5. Crear sesión de Stripe Checkout ---
  try {
    // Usamos secretKey (ya sanitizado con .trim()) — nunca releer process.env aquí
    const stripe = new Stripe(secretKey)

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      // client_reference_id = Supabase user ID → el webhook lo usa para actualizar la suscripción
      ...(userId ? { client_reference_id: userId } : {}),
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/pricing`,
      metadata: { plan },
    })

    console.log(`[Checkout] Sesión creada: ${session.id}`)
    return NextResponse.redirect(session.url!, 303)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const stripeErr = err as Record<string, unknown>
    console.error("[Checkout] Error de Stripe:", { message, type: stripeErr?.type, code: stripeErr?.code })
    return NextResponse.json(
      { error: `Error al crear la sesión de pago: ${message}` },
      { status: 500 }
    )
  }
}
