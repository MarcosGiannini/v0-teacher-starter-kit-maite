/**
 * Script de diagnóstico — verifica qué variables de Stripe ve Node.js
 * Uso: node scripts/check-keys.mjs
 * (No usa Next.js, lee .env.local manualmente para máxima fidelidad)
 */
import { readFileSync } from "fs"
import { resolve } from "path"

const envPath = resolve(process.cwd(), ".env.local")

let rawFile
try {
  rawFile = readFileSync(envPath, "utf8")
} catch {
  console.error("❌ No se encontró .env.local en:", envPath)
  process.exit(1)
}

// Detectar BOM (EF BB BF al inicio del archivo)
const hasBOM = rawFile.charCodeAt(0) === 0xfeff
console.log("BOM detectado:", hasBOM ? "⚠️  SÍ — esto puede causar problemas" : "✅ NO")

// Parsear variables manualmente (sin eval, sin shell)
const vars = {}
for (const line of rawFile.replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  const value = trimmed.slice(eqIdx + 1).trim()
  vars[key] = value
}

const secretKey = vars["STRIPE_SECRET_KEY"] ?? ""
const publishableKey = vars["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] ?? ""

console.log("\n--- STRIPE_SECRET_KEY ---")
console.log("  Longitud     :", secretKey.length)
console.log("  Empieza en   :", secretKey.slice(0, 12) || "(vacío)")
console.log("  Termina en   :", secretKey.slice(-4) || "(vacío)")
console.log("  Formato OK   :", secretKey.startsWith("sk_test_") || secretKey.startsWith("sk_live_") ? "✅" : "❌")

console.log("\n--- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ---")
console.log("  Longitud     :", publishableKey.length)
console.log("  Empieza en   :", publishableKey.slice(0, 12) || "(vacío)")
console.log("  Formato OK   :", publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_") ? "✅" : "❌")

console.log("\n--- Price IDs ---")
for (const k of ["STRIPE_PRICE_CAPSULAS_A1", "STRIPE_PRICE_CURSOS_B1_CORNELIA", "STRIPE_PRICE_MENTORSHIP"]) {
  const v = vars[k] ?? ""
  const ok = v.startsWith("price_") ? "✅" : "❌ NO configurado"
  console.log(` ${k}: ${ok} (${v.slice(0, 20) || "vacío"})`)
}
