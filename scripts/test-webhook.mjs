/**
 * Simulador de evento checkout.session.completed
 *
 * Uso:
 *   node scripts/test-webhook.mjs <SUPABASE_USER_ID> [plan]
 *
 * Ejemplo:
 *   node scripts/test-webhook.mjs b6b343c3-f9a0-4d92-80d6-37a04f912244 capsulas-a1
 *
 * IMPORTANTE: el servidor Next.js debe estar corriendo (npm run dev)
 * STRIPE_WEBHOOK_SECRET y STRIPE_SECRET_KEY deben estar configurados en .env.local
 */

import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import Stripe from "stripe"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath   = resolve(__dirname, "../.env.local")

// --- Leer .env.local ---
const vars = {}
try {
  const raw = readFileSync(envPath, "utf8").replace(/^\uFEFF/, "")
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i === -1) continue
    vars[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
} catch {
  console.error("No se encontró .env.local en:", envPath)
  process.exit(1)
}

const webhookSecret = vars["STRIPE_WEBHOOK_SECRET"]?.trim()
const stripeSecretKey = vars["STRIPE_SECRET_KEY"]?.trim()

if (!webhookSecret || !webhookSecret.startsWith("whsec_")) {
  console.error("STRIPE_WEBHOOK_SECRET no configurado o inválido:", webhookSecret?.slice(0, 12))
  process.exit(1)
}
if (!stripeSecretKey || !stripeSecretKey.startsWith("sk_")) {
  console.error("STRIPE_SECRET_KEY no configurado o inválido:", stripeSecretKey?.slice(0, 12))
  process.exit(1)
}

// --- Argumentos CLI ---
const userId = process.argv[2]
const plan   = process.argv[3] ?? "capsulas-a1"

if (!userId) {
  console.error("Debes pasar el Supabase User ID como primer argumento.")
  console.error("   Uso: node scripts/test-webhook.mjs <USER_ID> [plan]")
  process.exit(1)
}

// --- Construir payload del evento ---
const payload = JSON.stringify({
  id: `evt_test_${Date.now()}`,
  type: "checkout.session.completed",
  data: {
    object: {
      id: `cs_test_${Date.now()}`,
      object: "checkout.session",
      client_reference_id: userId,
      customer_email: "test@superteacher.local",
      customer: "cus_test_000",
      subscription: "sub_test_000",
      payment_status: "paid",
      status: "complete",
      metadata: { plan },
    },
  },
})

// --- Generar firma usando el MISMO SDK que usa el servidor ---
// Esto garantiza compatibilidad total con stripe.webhooks.constructEvent
const stripe = new Stripe(stripeSecretKey)
const stripeSignature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: webhookSecret,
})

// --- Enviar al endpoint local ---
const url = "http://localhost:3000/api/webhooks/stripe"
console.log(`\nEnviando evento simulado a ${url}`)
console.log(`   Usuario : ${userId}`)
console.log(`   Plan    : ${plan}`)
console.log(`   Secreto : ${webhookSecret.slice(0, 12)}...`)

try {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": stripeSignature,
    },
    body: payload,
  })

  const json = await res.json().catch(() => ({}))
  console.log(`\nRespuesta del servidor: HTTP ${res.status}`)
  console.log("   Body:", JSON.stringify(json, null, 2))

  if (res.ok) {
    console.log("\nSimulación completada. Comprueba Supabase → tabla subscriptions.")
  } else {
    console.error("\nEl servidor respondió con error. Revisa los logs del servidor Next.js.")
  }
} catch (err) {
  console.error("\nNo se pudo conectar con el servidor. ¿Está corriendo npm run dev?")
  console.error("   Error:", err.message)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath   = resolve(__dirname, "../.env.local")

// --- Leer .env.local ---
let vars = {}
try {
  const raw = readFileSync(envPath, "utf8").replace(/^\uFEFF/, "")
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i === -1) continue
    vars[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
} catch {
  console.error("❌ No se encontró .env.local en:", envPath)
  process.exit(1)
}

const webhookSecret = vars["STRIPE_WEBHOOK_SECRET"]
if (!webhookSecret || !webhookSecret.startsWith("whsec_")) {
  console.error("❌ STRIPE_WEBHOOK_SECRET no configurado o inválido. Valor actual:", webhookSecret?.slice(0, 10))
  process.exit(1)
}

// --- Argumentos CLI ---
const userId = process.argv[2]
const plan   = process.argv[3] ?? "capsulas-a1"

if (!userId) {
  console.error("❌ Debes pasar el Supabase User ID como primer argumento.")
  console.error("   Ejecución: node scripts/test-webhook.mjs <USER_ID> [plan]")
  process.exit(1)
}

// --- Construir payload del evento ---
const timestamp = Math.floor(Date.now() / 1000)
const event = {
  id: `evt_test_${Date.now()}`,
  type: "checkout.session.completed",
  data: {
    object: {
      id: `cs_test_${Date.now()}`,
      object: "checkout.session",
      client_reference_id: userId,
      customer_email: "test@superteacher.local",
      customer: "cus_test_000",
      subscription: "sub_test_000",
      payment_status: "paid",
      status: "complete",
      metadata: { plan },
    },
  },
}

const body = JSON.stringify(event)

// --- Firmar el payload (igual que hace Stripe) ---
// El SDK de Stripe decodifica la parte base64 del secreto antes de usarla como clave HMAC.
// Si usamos la cadena base64 directamente la firma nunca coincidirá.
const secretBytes = Buffer.from(webhookSecret.replace("whsec_", ""), "base64")
const signedPayload = `${timestamp}.${body}`
const hmac = createHmac("sha256", secretBytes)
  .update(signedPayload)
  .digest("hex")
const stripeSignature = `t=${timestamp},v1=${hmac}`

// --- Enviar al endpoint local ---
const url = "http://localhost:3000/api/webhooks/stripe"
console.log(`\n🚀 Enviando evento simulado a ${url}`)
console.log(`   Usuario: ${userId}`)
console.log(`   Plan:    ${plan}`)
console.log(`   Firma:   ${stripeSignature.slice(0, 40)}...`)

try {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": stripeSignature,
    },
    body,
  })

  const json = await res.json().catch(() => ({}))
  console.log(`\n📬 Respuesta del servidor: HTTP ${res.status}`)
  console.log("   Body:", JSON.stringify(json, null, 2))

  if (res.ok) {
    console.log("\n✅ Simulación completada. Comprueba Supabase → tabla subscriptions.")
  } else {
    console.error("\n❌ El servidor respondió con error. Revisa los logs del servidor Next.js.")
  }
} catch (err) {
  console.error("\n❌ No se pudo conectar con el servidor. ¿Está corriendo npm run dev?")
  console.error("   Error:", err.message)
}
