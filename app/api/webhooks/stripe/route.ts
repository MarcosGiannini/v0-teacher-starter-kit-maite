import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// ---------------------------------------------------------------------------
// IMPORTANTE: En Vercel/producción añade esta ruta a las excepciones de
// bodyParser (Next.js App Router lo gestiona automáticamente, pero si usas
// middleware que modifique el body, asegúrate de excluir esta ruta).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // --- 1. Leer body raw (necesario para verificar la firma de Stripe) ---
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  // --- 2. Validar variables de entorno ---
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim()

  if (!webhookSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET no está configurado")
    return NextResponse.json({ error: "Webhook secret no configurado" }, { status: 503 })
  }
  if (!secretKey) {
    console.error("[Webhook] STRIPE_SECRET_KEY no está configurado")
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 })
  }
  if (!sig) {
    console.error("[Webhook] Falta la cabecera stripe-signature")
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  // --- 3. Verificar firma (protege contra peticiones falsas) ---
  let event: Stripe.Event
  try {
    const stripe = new Stripe(secretKey)
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Webhook] Firma inválida:", message)
    return NextResponse.json({ error: `Webhook signature error: ${message}` }, { status: 400 })
  }

  console.log(`[Webhook] Evento: ${event.type}`)

  // --- 4. Procesar checkout.session.completed ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const userId     = session.client_reference_id   // Supabase user ID
    const email      = session.customer_email
    const plan       = session.metadata?.plan ?? null
    const customerId = typeof session.customer === "string" ? session.customer : null
    const subId      = typeof session.subscription === "string" ? session.subscription : null

    console.log(`[Webhook] Sesión completada — user=${userId}, plan=${plan}`)

    if (!userId) {
      console.error("[Webhook] ❌ No hay client_reference_id en la sesión. Imposible actualizar suscripción.")
      // Devolvemos 200 para que Stripe no reintente — es un error de configuración nuestro
      return NextResponse.json({ warning: "Missing client_reference_id" })
    }

    console.log(`[Webhook] Buscando usuario en Supabase: ${userId}`)

    // --- 5. Cliente Supabase con service role (bypasa RLS) ---
    const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[Webhook] SUPABASE_SERVICE_ROLE_KEY no está configurado")
      return NextResponse.json({ error: "Supabase admin no configurado" }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    // --- 6. Obtener current_period_end de la suscripción en Stripe ---
    let currentPeriodEnd: string | null = null
    if (subId) {
      try {
        const stripe = new Stripe(secretKey)
        const sub = await stripe.subscriptions.retrieve(subId)
        currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString()
      } catch (e) {
        console.warn("[Webhook] ⚠️  No se pudo obtener current_period_end:", e)
      }
    }

    // --- 7. Upsert en la tabla subscriptions ---
    const { error: dbError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id:                userId,
          status:                 "active",
          plan_id:                plan,
          stripe_customer_id:     customerId,
          stripe_subscription_id: subId,
          current_period_end:     currentPeriodEnd,
          updated_at:             new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (dbError) {
      console.error("[Webhook] Error guardando suscripción:", dbError.message)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    console.log(`[Webhook] Pago procesado para: ${email ?? userId}`)
  }

  return NextResponse.json({ received: true })
}
