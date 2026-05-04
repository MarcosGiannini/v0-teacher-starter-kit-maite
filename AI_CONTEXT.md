# AI_CONTEXT — Super Teacher

> Fichero técnico de referencia para asistentes IA que trabajen sobre este proyecto.
> Actualizado: 2026-05-04 (Fase 4.5: refactor estético + Fase 5.1: admin portal)

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
/dashboard            → requiere auth activa → redirect /login si no autenticado
/dashboard/admin/**   → requiere auth + app_metadata.role === 'admin' → redirect /dashboard si no admin
/login                → redirect /dashboard si ya autenticado
/signup               → redirect /dashboard si ya autenticado
```

### Cómo asignar el rol admin en Supabase
El rol se guarda en `app_metadata` (solo escribible por service_role — no editable por el usuario).
Ejecutar desde Supabase SQL Editor:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email = 'maite@superteacher.es';
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
| `localStorage` para notas (Fase 5) | PoC sin backend; migrar a tabla `user_notes` en Fase 6 |
| Tipo canónico `CmsLesson` en cms-config.ts | Abstracción de proveedor: cambiar CMS sin tocar páginas |
| `app_metadata.role` para admin | Solo escribible vía service_role; no editable por el usuario |
| `useActionState` en formulario admin | Feedback inmediato sin recarga; compatible con React 19 |

---

## 10. Portal de administración — Admin Contribution Hub

### Ruta
```
GET /dashboard/admin/upload
```
**Componente**: `app/dashboard/admin/upload/page.tsx` (`'use client'`)

### Acceso
El middleware verifica `user.app_metadata.role === 'admin'` antes de llegar a la página.
Si el rol no coincide → redirect a `/dashboard`.

### Formulario — Campos

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| `title` | text | ✅ | max 200 chars |
| `slug` | text | ✅ | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 120 |
| `plan_id` | select | ✅ | `capsulas-a1` \| `cursos-b1-cornelia` \| `mentorship` |
| `order_index` | number | — | ≥ 1, default 1 |
| `video_url` | url | — | `^https?://` |
| `duration_s` | number | — | segundos, ≥ 0 |
| `description` | textarea | — | texto libre |
| `is_preview` | checkbox | — | si marcado, lección gratuita |

### Server Action
```
app/actions/create-lesson.ts
```
- Verifica de nuevo auth + role (defensa en profundidad)
- Validación de campos + errores granulares por campo
- `supabase.from('lessons').insert({...})`
- Error code `23505` → slug duplicado → mensaje específico
- `revalidatePath('/dashboard')` al guardar correctamente
- Usa `useActionState(createLesson, initialState)` en cliente para feedback sin recarga

---

## 10. Schema v2 — Tablas de engagement (supabase/schema_v2.sql)

> ⚠️ **Diseñado, NO ejecutado en producción.** Ejecutar en Supabase SQL Editor cuando se active la funcionalidad.

### Tabla: `lessons`
Catálogo de lecciones. Puede poblarse manualmente o desde un CMS headless.
```sql
CREATE TABLE lessons (
  id uuid PK, slug text UNIQUE, title text,
  plan_id text,   -- 'capsulas-a1' | 'cursos-b1-cornelia' | 'mentorship'
  order_index int, video_url text, duration_s int,
  is_preview bool DEFAULT false
)
```

### Tabla: `user_notes`
Apuntes privados de cada alumno vinculados a una lección.
```sql
CREATE TABLE user_notes (
  id uuid PK, user_id uuid → auth.users, lesson_id uuid → lessons,
  content text, created_at/updated_at timestamptz,
  UNIQUE (user_id, lesson_id)   -- 1 bloque de notas por (alumno, lección)
)
```
- RLS: SELECT/INSERT/UPDATE/DELETE solo sobre filas propias (`auth.uid() = user_id`)

### Tabla: `community_posts`
Posts del foro privado, visibles solo para suscriptores activos.
```sql
CREATE TABLE community_posts (
  id uuid PK, user_id uuid → auth.users, lesson_id uuid → lessons (nullable),
  title text, content text, is_pinned bool, is_hidden bool
)
```
- RLS SELECT: `is_hidden = false AND subscriptions.status = 'active'`

### Tabla: `community_replies`
Respuestas a posts (un nivel de profundidad).
```sql
CREATE TABLE community_replies (
  id uuid PK, post_id uuid → community_posts, user_id uuid → auth.users,
  content text, is_hidden bool
)
```

---

## 11. Arquitectura de contenidos (lib/cms-config.ts)

```typescript
// Tipo canónico — todos los adaptadores deben devolver este tipo
interface CmsLesson { id, slug, title, description, planId, orderIndex, videoUrl, durationSeconds, isPreview }

// Proveedor activo
const CMS_PROVIDER: 'none' | 'contentful' | 'sanity' | 'storyblok' = 'none'

// Funciones de acceso (usar en Server Components)
getLessonBySlug(slug: string): Promise<CmsLesson | null>
getLessonsByPlan(planId: string): Promise<CmsLesson[]>
```

**Migrar a Sanity** (recomendado):
1. `npm install next-sanity`
2. Cambiar `CMS_PROVIDER = 'sanity'`
3. Añadir variables: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`
4. Implementar adaptador `getSanityLessonBySlug()`

---

## 12. Notas de alumno — LessonNotes (components/lesson-notes.tsx)

Componente client `'use client'`. Props: `lessonId: string`.

**Estado actual (PoC localStorage)**:
- `localStorage.getItem/setItem('super-teacher:notes:' + lessonId)`
- Autosave con debounce de 600 ms tras cada keystroke
- Indicador visual de hora de guardado (`aria-live="polite"`)
- Skeleton mientras hidrata para evitar layout shift

**Ruta de lección**: `app/dashboard/leccion/[slug]/page.tsx`
- Protegida: redirige a `/login` si no autenticado, a `/pricing` si sin suscripción activa
- Verifica `subscriptions.status = 'active'` antes de renderizar
- Renderiza `<LessonNotes lessonId={slug} />`

**Migrar a Supabase (Fase 6)**:
1. Ejecutar `supabase/schema_v2.sql` en Supabase
2. Reemplazar `localStorage` por `supabase.from('user_notes').upsert({...})`
3. El `lessonId` pasará de ser el `slug` (string) al `uuid` de la tabla `lessons`

---

## 13. Estado del proyecto (2026-05-04)

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
- **Fase 5**: `supabase/schema_v2.sql` (lessons + user_notes + community_posts + community_replies)
- **Fase 5**: `components/lesson-notes.tsx` (PoC localStorage con autosave + skeleton)
- **Fase 5**: `app/dashboard/leccion/[slug]/page.tsx` (ruta protegida + placeholder de lección)
- **Fase 5**: `lib/cms-config.ts` (abstracción CmsLesson + datos estáticos + comentarios Sanity/Contentful)
- **Fase 4.5**: Refactor estético — `max-w-6xl`, sección Hero con más aire, grid Profesora 60/40
- **Fase 5.1**: Middleware admin (`app_metadata.role`), `/dashboard/admin/upload`, `app/actions/create-lesson.ts`

### ⏳ Pendiente / Producción
- Subir foto real de Maite (reemplazar `<div>` placeholder)
- Configurar dominio `superteacher.es` en Vercel
- Reemplazar `STRIPE_WEBHOOK_SECRET` con signing secret real
- Crear endpoint webhook en Stripe Dashboard (producción)
- SQL: `ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);`
- Ejecutar `supabase/schema_v2.sql` en Supabase SQL Editor (cuando se active la funcionalidad)
- Asignar `app_metadata.role = 'admin'` a Maite (SQL en sección 5 de este documento)
- Migrar `LessonNotes` de localStorage a tabla `user_notes` (Fase 6)
- Poblar tabla `lessons` o conectar CMS real (Sanity recomendado)
- Implementar integración Tally.so
- Página de listado de lecciones por plan en `/dashboard`
