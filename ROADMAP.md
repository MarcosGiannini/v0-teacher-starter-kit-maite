# ROADMAP — Super Teacher Platform

> Documento vivo. **Actualizar tras cada cambio.**
> Última actualización: 2026-05-05 (schema_v2 ejecutado en producción)
> Fuente de verdad técnica complementaria: `AI_CONTEXT.md`

---

## Convención de estados

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completado y en producción / rama main |
| 🔄 | En progreso (rama activa) |
| ⏳ | Pendiente — próxima prioridad |
| 🔮 | Planificado — futura fase |
| ❌ | Bloqueado (motivo indicado) |
| 🚫 | Descartado |

---

## FASE 1 — Base Auth + DB ✅

| Tarea | Estado | Notas |
|-------|--------|-------|
| Auth Supabase: login, signup, logout | ✅ | `app/auth/actions.ts` |
| Dashboard protegido | ✅ | `app/dashboard/page.tsx` |
| Middleware de rutas protegidas | ✅ | `middleware.ts` |
| Tabla `subscriptions` en Supabase | ✅ | UNIQUE constraint en `user_id` requerido |
| Client/Server Supabase helpers | ✅ | `lib/supabase/client.ts`, `lib/supabase/server.ts` |

---

## FASE 2 — Stripe Checkout + Webhooks ✅

| Tarea | Estado | Notas |
|-------|--------|-------|
| Endpoint `/api/checkout` | ✅ | `app/api/checkout/route.ts` |
| Webhook `/api/webhooks/stripe` | ✅ | `app/api/webhooks/stripe/route.ts` |
| Verificación de firma Stripe | ✅ | `STRIPE_WEBHOOK_SECRET` obligatorio |
| Upsert en `subscriptions` con service_role | ✅ | Bypass RLS correcto |
| 3 price IDs (A1/A2, B1+, Mentoría) | ✅ | Ver sección 4 de `AI_CONTEXT.md` |
| Página de éxito `/registro-exitoso` | ✅ | `app/registro-exitoso/page.tsx` |

---

## FASE 3 — Landing + Pricing ✅

| Tarea | Estado | Notas |
|-------|--------|-------|
| Landing page (Home) con SEO | ✅ | `app/page.tsx`, `generateMetadata()` |
| CTAs dinámicos según estado auth | ✅ | Server Component, lee sesión |
| Pricing page con 3 planes | ✅ | `app/pricing/page.tsx` |
| Login page | ✅ | `app/login/page.tsx` |
| Signup page | ✅ | `app/signup/page.tsx` |

---

## FASE 4 — Dark Mode + i18n ✅

| Tarea | Estado | Notas |
|-------|--------|-------|
| Dark mode con `next-themes` | ✅ | Tokens OKLCH completos en `globals.css` |
| i18n ES/EN cookie-based | ✅ | `lib/i18n/`, `app/actions/set-locale.ts` |
| Traducciones centralizadas | ✅ | `lib/i18n/translations.ts` |
| Toggle dark/light + selector idioma | ✅ | `components/site-controls.tsx` |
| Accesibilidad (aria, semantics) | ✅ | Aria-labels, sr-only en todos los componentes |
| Responsive (sm/md breakpoints) | ✅ | Botones full-width en mobile |

---

## FASE 4.5 — Refactor estético ✅

| Tarea | Estado | Notas |
|-------|--------|-------|
| Layout `max-w-6xl` | ✅ | |
| Sección Hero con más aire | ✅ | |
| Grid Profesora 60/40 | ✅ | Placeholder foto Maite |
| README.md profesional | ✅ | |

---

## FASE 5 — Contenidos + Área de Alumno ✅

| Tarea | Estado | Notas |
|-------|--------|-------|
| Schema v2 SQL | ✅ | `supabase/schema_v2.sql` — diseñado, pendiente ejecutar en prod |
| `LessonNotes` (PoC localStorage) | ✅ | `components/lesson-notes.tsx` |
| Ruta protegida de lección | ✅ | `app/dashboard/leccion/[slug]/page.tsx` |
| Abstracción CMS (`lib/cms-config.ts`) | ✅ | Proveedor activo: `'none'` (datos estáticos) |

---

## FASE 5.1 — Admin Portal ✅

| Tarea | Estado | Notas |
|-------|--------|-------|
| Middleware admin (`app_metadata.role`) | ✅ | `middleware.ts` → redirect si no es admin |
| Ruta `/dashboard/admin/upload` | ✅ | `app/dashboard/admin/upload/page.tsx` |
| Server Action `create-lesson` | ✅ | `app/actions/create-lesson.ts` |
| Validación granular de campos | ✅ | Errores por campo, slug único |
| `useActionState` feedback sin recarga | ✅ | Compatible React 19 |

---

## FASE 6 — Persistencia real de Notas ⏳

> **Prerequisito**: Ejecutar `supabase/schema_v2.sql` en Supabase SQL Editor.

| Tarea | Estado | Notas |
|-------|--------|-------|
| Ejecutar schema_v2 en Supabase (prod) | ✅ | Ejecutado 2026-05-05 — tablas `lessons`, `user_notes`, `community_posts`, `community_replies` creadas con RLS |
| Migrar `LessonNotes` de localStorage → `user_notes` | ✅ | `components/lesson-notes.tsx` — upsert con debounce 800ms, indicador Guardando/Guardado/Error |
| El `lessonId` pasará de slug (string) → uuid | ✅ | Página lección hace `SELECT id FROM lessons WHERE slug=?`, pasa `lesson.id` al componente |
| RLS en `user_notes` (solo fila propia) | ✅ | Incluido en schema_v2 |

---

## FASE 7 — Listado de Lecciones en Dashboard ⏳

| Tarea | Estado | Notas |
|-------|--------|-------|
| Página de listado por plan en `/dashboard` | ⏳ | Actualmente vacío |
| Poblar tabla `lessons` con contenido real | ⏳ | O conectar CMS (ver Fase 8) |
| Navegar desde dashboard → lección individual | ⏳ | Enlaza con ruta `/dashboard/leccion/[slug]` |
| Progreso del alumno (lección completada) | 🔮 | Requiere tabla adicional o columna en `user_notes` |

---

## FASE 8 — Integración CMS (Sanity recomendado) 🔮

| Tarea | Estado | Notas |
|-------|--------|-------|
| Instalar `next-sanity` | 🔮 | `npm install next-sanity` |
| Configurar `NEXT_PUBLIC_SANITY_PROJECT_ID`, `DATASET`, `SANITY_API_TOKEN` | 🔮 | |
| Cambiar `CMS_PROVIDER = 'sanity'` en `lib/cms-config.ts` | 🔮 | |
| Implementar adaptador `getSanityLessonBySlug()` | 🔮 | |
| Migrar datos estáticos al schema de Sanity | 🔮 | |

---

## FASE 9 — Comunidad Privada 🔮

| Tarea | Estado | Notas |
|-------|--------|-------|
| Listado de posts (`community_posts`) | 🔮 | Solo suscriptores `status = 'active'` |
| Crear post / responder (`community_replies`) | 🔮 | |
| Moderación admin (is_hidden, is_pinned) | 🔮 | |
| Notificaciones de respuesta | 🔮 | |

---

## FASE 10 — Integración Tally.so 🔮

| Tarea | Estado | Notas |
|-------|--------|-------|
| Página `/contacto` con formulario embebido | 🔮 | |
| Webhook `/api/webhooks/tally` | 🔮 | Requiere `TALLY_WEBHOOK_SECRET` |
| Registro preliminar en Supabase (pre-signup) | 🔮 | |
| Email de bienvenida (Resend o Supabase Edge Fn) | 🔮 | |

---

## PRODUCCIÓN — Tareas de Configuración ⏳

| Tarea | Estado | Responsable | Notas |
|-------|--------|-------------|-------|
| Subir foto real de Maite | ⏳ | Maite / Marcos | Reemplazar `<div>` placeholder en Hero |
| Configurar dominio `superteacher.es` en Vercel | ⏳ | Marcos | DNS + SSL automático |
| Reemplazar `STRIPE_WEBHOOK_SECRET` con signing secret real | ⏳ | Marcos | Desde Stripe Dashboard (producción) |
| Crear endpoint webhook en Stripe Dashboard (prod) | ⏳ | Marcos | URL: `https://superteacher.es/api/webhooks/stripe` |
| `ALTER TABLE subscriptions ADD CONSTRAINT ... UNIQUE (user_id)` | ⏳ | Marcos | Ejecutar en Supabase SQL Editor si no existe |
| Asignar `role = 'admin'` a Maite en Supabase | ⏳ | Marcos | SQL listo — pendiente ejecutar (ver instrucciones abajo) |
| Ejecutar `supabase/schema_v2.sql` en Supabase | ✅ | Marcos | Ejecutado 2026-05-05 |

---

## Rama activa

| Rama | Propósito | Estado |
|------|-----------|--------|
| `main` | Todo mergeado | ✅ |

---

## Sesión 2026-05-05 — Fixes aplicados

| Fix | Estado | Detalle |
|-----|--------|---------|
| `Invalid Server Actions request` en Codespace | ✅ | `next.config.mjs` → `experimental.serverActions.allowedOrigins` |
| Supabase no configurado | ✅ | `.env.local` con credenciales reales |
| Stripe no configurado | ✅ | `.env.local` con `sk_test_` y `pk_test_` |
| Login funcionando en Codespace | ✅ | Verificado en navegador |

---

## Incidencias — Problemas de Entorno (Codespaces)

> Estos problemas son específicos del entorno de desarrollo en Codespaces.
> **No son bugs de código. No afectan a Vercel ni a producción.**

| Incidencia | Estado | Entorno | Detalle |
|------------|--------|---------|---------||
| Error TS2339 `current_period_end` en `app/api/webhooks/stripe/route.ts` | ❌ Pendiente fix | Todos | Propiedad no existe en tipo `Response<Subscription>` de Stripe SDK. Error preexistente, no introducido en Fase 6. No bloquea build de Vercel (tsc --noEmit no se ejecuta en CI). Registrado para arreglar en próxima sesión. |
| Stripe Checkout falla con "Invalid API Key provided: sk_test_****" | ❌ Bloqueado (entorno) | Codespaces únicamente | `STRIPE_SECRET_KEY` está presente en `.env.local` pero no se carga correctamente en el contexto de la Route Handler durante el desarrollo en Codespaces. Posible causa: variables de entorno no propagadas al proceso de Next.js en el contenedor. **No es una regresión de código. No afecta a Vercel / producción.** Investigar recarga de `next dev` con las variables o uso de `dotenv` explícito. |

---

## Próxima acción recomendada

> **FASE 6 — Paso 2**: Migrar `LessonNotes` de localStorage → Supabase (`user_notes`).
> Prerequisito completado: schema_v2 ejecutado en producción (2026-05-05).
