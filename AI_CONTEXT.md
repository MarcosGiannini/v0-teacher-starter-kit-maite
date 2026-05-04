# AI_CONTEXT — Super Teacher

> Fichero técnico de referencia para asistentes IA que trabajen sobre este proyecto.
> Actualizado: 2026-05-04

---

## 1. Identidad del proyecto

- **Nombre**: Super Teacher
- **Propietaria**: Maite Colodrón (profesora de español)
- **Desarrollador**: Marcos Giannini
- **Repo**: `https://github.com/MarcosGiannini/v0-teacher-starter-kit-maite`
- **Deploy**: Vercel, rama `main` → producción automática
- **URL producción**: `https://superteacher.es` (pendiente de configurar dominio)

---

## 2. Stack y versiones

```
Next.js        16.2.4   (App Router, Turbopack, React 19)
TypeScript     5.x
Tailwind CSS   v4       (postcss, sin tailwind.config.js)
next-themes    0.4.6
Supabase       @supabase/ssr 0.10.x  +  @supabase/supabase-js 2.x
Stripe         22.1.0
Node.js        ≥ 20
npm            ≥ 10 (packageManager: npm@10.9.2)
```

### Paleta de color (OKLCH, globals.css)
```
--primary:    oklch(0.52 0.13 42)   Terracotta/earth
--background: oklch(0.97 0.012 80)  Warm cream
--secondary:  oklch(0.82 0.06 75)   Warm sand
Dark mode variables definidas en .dark { } (globals.css líneas ~65–100)
```

---

## 3. Autenticación (Supabase)

- **URL**: `https://zbbfwlbgvddyblvorbha.supabase.co`
- **Método**: Cookie-based SSR auth vía `@supabase/ssr`
- **Client browser**: `lib/supabase/client.ts` → `createBrowserClient()`
- **Client server**: `lib/supabase/server.ts` → `createServerClient()` con cookies de `next/headers`
- **Server actions auth**: `app/auth/actions.ts` (login, signup, logout)

### Tabla `subscriptions`
```sql
CREATE TABLE subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id),
  stripe_customer_id     text,
  stripe_subscription_id text,
  price_id               text,
  status                 text NOT NULL DEFAULT 'inactive',
  created_at             timestamptz DEFAULT now(),
  CONSTRAINT subscriptions_user_id_key UNIQUE (user_id)  -- ← CRÍTICO para upsert
);
```
> ⚠️ El UNIQUE constraint en `user_id` es obligatorio. Sin él el webhook falla con "no unique constraint matched".

---

## 4. Stripe — Webhooks

### Endpoint
```
POST /api/webhooks/stripe
Handler: app/api/webhooks/stripe/route.ts
```

### Evento procesado
```
checkout.session.completed
```

### Flujo de procesamiento
1. Verificar firma con `Stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`
2. Extraer `session.client_reference_id` (= Supabase `user_id`)
3. Extraer `session.customer` (Stripe customer ID) y `session.subscription`
4. Upsert en tabla `subscriptions` con `onConflict: 'user_id'`
5. Usar `SUPABASE_SERVICE_ROLE_KEY` para bypass RLS

### Variable de entorno crítica
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```
- En desarrollo local: valor que imprime `stripe listen --forward-to ...`
- En producción Vercel: signing secret del endpoint en Stripe Dashboard
- ⚠️ El valor `whsec_test_secret_12345` en `.env.local` es un PLACEHOLDER — reemplazar antes de ir a producción

### IDs de Productos (Stripe Test Mode)
```env
STRIPE_PRICE_CAPSULAS_A1=price_1TT3Y9LjZeefiuz4Bs3ylqt8       # 19€/mes  — A1/A2
STRIPE_PRICE_CURSOS_B1_CORNELIA=price_1TT3j5LjZeefiuz4CH5Ap0lD # 49€/mes  — B1+ Cornelia
STRIPE_PRICE_MENTORSHIP=price_1TT3kJLjZeefiuz4wnjMsXBJ          # 149€/mes — Mentoría 1-a-1
```

### Endpoint de Checkout
```
POST /api/checkout?plan=<plan-id>
Handler: app/api/checkout/route.ts
```
Crea una Stripe Checkout Session con:
- `client_reference_id` = Supabase user ID (enlace auth ↔ pago)
- `customer_email` = email del usuario autenticado
- `success_url` = `/registro-exitoso`
- `cancel_url` = `/pricing`

---

## 5. Rutas protegidas (middleware.ts)

```
/dashboard  → requiere auth activa → redirect /login si no autenticado
/login      → redirect /dashboard si ya autenticado
/signup     → redirect /dashboard si ya autenticado
```

### Comportamiento Edge Runtime
El middleware usa `getEnv()` para leer variables **dentro** de la función (no a nivel módulo). Esto evita el error `Invalid supabaseUrl` en Edge Runtime cold starts. Toda la lógica va en try/catch y cae a `NextResponse.next()` si falla.

---

## 6. i18n — Sistema de traducciones

### Arquitectura
```
lib/i18n/
  translations.ts   → objeto { es: {...}, en: {...} } con TODOS los textos
  get-locale.ts     → lee cookie 'locale' (server utility, async)

app/actions/
  set-locale.ts     → Server Action: escribe cookie 'locale' + revalidatePath

components/
  site-controls.tsx → Client component: toggle dark/light + selector ES·EN
```

### Flujo de cambio de idioma
1. Usuario hace click en ES o EN (SiteControls)
2. `startTransition(async () => { await setLocale(loc); router.refresh() })`
3. Server Action escribe cookie `locale` (httpOnly, 1 año, sameSite: lax)
4. `router.refresh()` fuerza re-render del Server Component con nuevo locale
5. `<html lang={locale}>` se actualiza automáticamente

### Añadir idioma nuevo
```typescript
// lib/i18n/translations.ts
export type Locale = 'es' | 'en' | 'fr'  // 1. añadir clave
export const translations = {
  es: { ... },
  en: { ... },
  fr: { /* duplicar estructura de 'es' y traducir */ }
}
```

---

## 7. Dark Mode

- Implementado con `next-themes` v0.4.6
- Atributo: `class` (añade clase `.dark` al `<html>`)
- Default: `system` (sigue preferencia del SO)
- `<html suppressHydrationWarning>` en layout.tsx para evitar mismatch
- Tokens CSS en `app/globals.css`: `:root { ... }` + `.dark { ... }`
- Toggle visual: `components/site-controls.tsx` (esquina superior derecha)

---

## 8. Tally.so — Flujo (planificado)

> ⚠️ No implementado aún. Esta sección documenta la integración prevista.

**Caso de uso**: Formulario de contacto / onboarding inicial antes del pago.

**Integración propuesta**:
1. Embeber formulario Tally en una nueva página `/contacto` o modal
2. Al enviar, Tally notifica via webhook a `/api/webhooks/tally`
3. El handler crea un registro preliminar en Supabase (pre-signup)
4. Envío de email de bienvenida vía Supabase Edge Functions o Resend

**Variables necesarias** (cuando se implemente):
```env
TALLY_WEBHOOK_SECRET=...
```

---

## 9. Decisiones arquitectónicas relevantes

| Decisión | Motivo |
|----------|--------|
| Server Components por defecto | Performance, SEO, sin JS innecesario en cliente |
| Cookie para locale (no URL) | No requiere cambiar rutas ni estructura de directorios |
| `supabase.service_role` en webhook | Bypass RLS necesario para escribir sin sesión de usuario |
| `Promise.all([getLocale(), createClient()])` en home | Paralelizar llamadas independientes → menor latencia |
| `suppressHydrationWarning` en `<html>` | next-themes modifica la clase antes de hidratación |
| No `tailwind.config.js` | Tailwind v4 se configura vía postcss + `@theme inline` en CSS |
| `generateMetadata()` async | Permite metadata dinámica basada en locale |

---

## 10. Estado del proyecto (2026-05-04)

### ✅ Implementado
- Auth completa (login, signup, logout, dashboard, middleware)
- Stripe Checkout + Webhooks (firma, upsert subscriptions)
- Landing page (Home) con SEO, CTAs dinámicos según estado auth
- Pricing page con 3 planes (A1/A2 · B1+ · Mentoría)
- Dark mode (next-themes, tokens OKLCH completos)
- i18n ES/EN (traducciones centralizadas, cookie-based, sin cambio de URL)
- Accesibilidad: aria-labels, aria-hidden, sr-only, roles semánticos
- Responsive: breakpoints sm/md, max-w-screen-md/lg, botones full-width en mobile
- README.md profesional + AI_CONTEXT.md

### ⏳ Pendiente / Producción
- Subir foto real de Maite (reemplazar `<div>` placeholder)
- Configurar dominio `superteacher.es` en Vercel
- Reemplazar `STRIPE_WEBHOOK_SECRET` con signing secret real
- Crear endpoint webhook en Stripe Dashboard (producción)
- SQL: `ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);`
- Implementar integración Tally.so
- Área de contenidos en `/dashboard` (vídeos, PDFs)
