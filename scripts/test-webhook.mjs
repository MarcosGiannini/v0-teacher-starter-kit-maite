/**
 * Simulador de evento checkout.session.completed
 *
 * Uso:
 *   node scripts/test-webhook.mjs <SUPABASE_USER_ID> [plan]
 *
 * Ejemplo:
 *   node scripts/test-webhook.mjs 5f3e1234-aaaa-bbbb-cccc-000000000001 capsulas-a1
 *
 * IMPORTANTE: el servidor Next.js debe estar corriendo (npm run dev)
 * y STRIPE_WEBHOOK_SECRET debe estar configurado en .env.local
 */

import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { createHmac } from "crypto"

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
const signedPayload = `${timestamp}.${body}`
const hmac = createHmac("sha256", webhookSecret.replace("whsec_", ""))
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
