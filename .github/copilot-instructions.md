# Copilot Instructions — Super Teacher Platform

> Este fichero es cargado automáticamente por GitHub Copilot en cada sesión.
> Complementa `AI_CONTEXT.md` con reglas de calidad y seguridad obligatorias.
> Prioridad: **AI_CONTEXT.md > ROADMAP.md > este fichero > README.md**

---

## 🔒 REGLAS ABSOLUTAS (NO NEGOCIABLES)

1. **Nunca trabajar directamente en `main`** — siempre rama nueva.
2. **Nunca subir secretos** al repositorio. Ninguna variable de entorno secreta va en código.
3. **Leer ROADMAP.md antes de implementar cualquier feature**.
4. **Explicar siempre**: qué cambias, por qué, qué ficheros afecta.
5. **Detenerse y preguntar** ante cualquier duda de arquitectura o seguridad.

---

## 🐛 TypeScript — Calidad de Tipos

### ❌ PROHIBIDO
```typescript
// NUNCA usar any
const data: any = response           // ❌
function handler(req: any) {}        // ❌
const user = result as any           // ❌

// NUNCA non-null assertion sin certeza absoluta
const id = user!.id                  // ❌ (a menos que ya hayas comprobado user != null)
```

### ✅ CORRECTO
```typescript
// Usar unknown y narrowing
const data: unknown = response
if (typeof data === 'object' && data !== null && 'id' in data) { ... }

// Usar tipos explícitos en funciones públicas y Server Actions
export async function createLesson(
  _prev: CreateLessonState,
  formData: FormData,
): Promise<CreateLessonState> { ... }

// Usar satisfies para validar formas sin perder literales
const config = { role: 'admin' } satisfies { role: string }
```

### Tipos en este proyecto
- Tipo canónico de lección: `CmsLesson` (en `lib/cms-config.ts`)
- Estado de Server Action: siempre exportar el tipo (`CreateLessonState`, etc.)
- Resultados de Supabase: extraer tipos con `Database['public']['Tables']['X']['Row']`
- No usar `as` para forzar tipos — usar guards o zod para validar en runtime

---

## 🔐 Seguridad — Capas Obligatorias

### Regla de las dos capas
Toda operación protegida DEBE verificarse en **dos lugares independientes**:

| Capa | Dónde | Qué verifica |
|------|-------|-------------|
| 1 | `middleware.ts` | Sesión activa + rol para rutas admin |
| 2 | Server Action / Route Handler | Sesión activa + rol (de nuevo) |

**Nunca confiar solo en el middleware** — un atacante puede llamar directamente al Server Action.

```typescript
// ✅ Patrón correcto en TODA Server Action o API Route
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) redirect('/login')
if (user.app_metadata?.role !== 'admin') redirect('/dashboard')
```

### Inputs — Validar SIEMPRE en el servidor
```typescript
// ❌ Validar solo en el cliente con HTML5 no es suficiente
// ✅ Toda validación debe ocurrir en el Server Action / Route Handler

// Patrón: extraer, limpiar, validar, rechazar con fieldErrors si falla
const title = (formData.get('title') as string | null)?.trim() ?? ''
if (!title || title.length > 200) {
  return { success: false, fieldErrors: { title: 'Título inválido.' } }
}
```

### Variables de entorno
```typescript
// ❌ NUNCA mover secretos a NEXT_PUBLIC_
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_...   // ❌ expuesto al navegador

// ✅ Solo tres variables van en NEXT_PUBLIC_ en este proyecto:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
// El resto (STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, etc.) = solo servidor
```

### Supabase — Qué cliente usar cuándo
| Operación | Cliente | Motivo |
|-----------|---------|--------|
| Leer datos propios del usuario | `createClient()` (anon) | RLS lo filtra |
| Escribir en nombre del usuario | `createClient()` (anon) | RLS lo protege |
| Webhook / operaciones sin sesión | `service_role` directo | Bypass RLS controlado |
| Leer datos de auth.users | `service_role` | RLS no aplica a auth.users |

```typescript
// service_role solo en Route Handlers nunca expuestos al cliente
import { createClient } from '@supabase/supabase-js'
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // ← solo servidor, nunca NEXT_PUBLIC_
)
```

### Stripe Webhooks
```typescript
// ✅ Siempre verificar firma antes de procesar el evento
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
// Si constructEvent lanza → 400 Bad Request. Nunca procesar sin firma válida.
```

---

## 🏗 Arquitectura — Server vs Client Components

### Regla de oro
```
Server Component por defecto.
'use client' solo cuando necesites:
  - useState / useReducer / useEffect
  - Event handlers del DOM (onClick, etc.)
  - Browser APIs (localStorage, window, etc.)
  - React hooks de terceros que no soporten SSR
```

### Prohibido en Server Components
```typescript
'use server' // ← esto NO es la directiva de Server Component, es de Server Action

// En un Server Component no uses:
useState, useEffect, useRef             // ❌
onClick, onChange (inline)              // ❌
localStorage, sessionStorage            // ❌
```

### Prohibido en Client Components
```typescript
'use client'
// No hagas fetch directo a Supabase desde un Client Component sin pasar por Server Action
// No importes SUPABASE_SERVICE_ROLE_KEY ni STRIPE_SECRET_KEY
// No hagas lógica de negocio compleja — muévela a Server Actions
```

### Patrón para este proyecto
```
app/page.tsx (Server) → lee datos → pasa props a → components/ui/* (Client si necesario)
app/actions/*.ts (Server Action) → mutaciones desde Client Components
app/api/*/route.ts (Route Handler) → webhooks externos (Stripe, Tally)
```

---

## 🧹 Código Limpio

### Nombres
```typescript
// ✅ Verbos para acciones, sustantivos para datos
async function createLesson()          // acción = verbo
async function getLessonsByPlan()      // consulta = get + sustantivo
const isAdmin = role === 'admin'       // booleano = is/has/can

// ❌ Nombres vagos
async function handle()
async function process()
const data = ...
const result = ...
```

### Funciones
- Una función = una responsabilidad
- Máximo ~40 líneas. Si crece → separar
- Sin efectos secundarios inesperados
- Sin parámetros booleanos (`doSomething(true)` → no sabes qué hace el `true`)

### Constantes mágicas
```typescript
// ❌
if (status === 'active') ...
await sleep(3000)

// ✅
const SUBSCRIPTION_ACTIVE_STATUS = 'active' as const
const DEBOUNCE_MS = 3000
```

### Comentarios
- **No** comentar el qué (el código debe explicarse solo)
- **Sí** comentar el por qué cuando no es obvio
```typescript
// ❌
// Obtenemos el usuario
const { data: { user } } = await supabase.auth.getUser()

// ✅
// Doble verificación: el middleware ya comprobó el rol,
// pero un atacante puede llamar este Server Action directamente.
if (user.app_metadata?.role !== 'admin') redirect('/dashboard')
```

---

## ♿ Accesibilidad (Obligatoria)

```typescript
// ✅ Siempre en iconos decorativos
<Icon aria-hidden="true" />

// ✅ Siempre en imágenes de contenido
<img alt="Maite Colodrón, profesora de español" />

// ✅ Botones con texto visible o aria-label
<button aria-label="Cerrar diálogo">✕</button>

// ✅ Errores de formulario: role="alert" o aria-live="polite"
<p role="alert" id="field-error">{error}</p>
<input aria-describedby="field-error" aria-invalid={!!error} />

// ✅ Landmarks semánticos
<main>, <nav aria-label="...">, <header>, <footer>
```

---

## 🚫 Patrones Prohibidos en este Proyecto

| Prohibición | Alternativa |
|-------------|-------------|
| `any` en TypeScript | `unknown` + narrowing |
| Secretos en `NEXT_PUBLIC_` | Variables de servidor |
| Lógica auth solo en middleware | Middleware + Server Action |
| `console.log` con datos de usuario | Solo loggear mensajes seguros |
| Mutar `main` directamente | Rama `feat/`, `fix/`, `chore/` |
| Instalar dependencias sin justificación | Proponer y esperar confirmación |
| Refactorizar código no relacionado | Solo tocar lo pedido |
| Campo de formulario sin validación servidor | Validar siempre en Server Action |
| Fetch a Supabase desde Client Component | Server Action o Server Component |
| `eslint-disable` sin comentario explicativo | Arreglar el problema real |

---

## 📋 Checklist antes de hacer commit

- [ ] ¿Crea rama nueva? (no `main`)
- [ ] ¿Ningún `any` introducido?
- [ ] ¿Ningún secreto en el código?
- [ ] ¿La Server Action verifica auth + rol si es protegida?
- [ ] ¿Los inputs del formulario se validan en el servidor?
- [ ] ¿Todos los iconos tienen `aria-hidden="true"`?
- [ ] ¿El ROADMAP.md está actualizado?
- [ ] ¿TypeScript compila sin errores? (`tsc --noEmit`)

---

## ✅ PROTOCOLO DE VERIFICACIÓN — OBLIGATORIO TRAS CADA CAMBIO

**Al terminar cualquier implementación, SIEMPRE incluir un bloque así:**

---

### 🔍 Qué verificar

Describir exactamente:
1. **Dónde ir** — ruta URL, panel de Supabase, terminal, etc.
2. **Qué hacer paso a paso** — clicks, datos a introducir, comandos a ejecutar
3. **Qué debes VER** si todo va bien (comportamiento esperado ✅)
4. **Qué NO debes ver** — errores concretos que indicarían fallo ❌
5. **Qué herramienta usar** — según el tipo de cambio:

| Tipo de cambio | Herramienta de verificación |
|----------------|----------------------------|
| UI visual / layout | Navegador → inspeccionar visualmente la página |
| Error de red / request | Chrome DevTools → pestaña **Network** (F12 → Network) |
| Error de JS en cliente | Chrome DevTools → pestaña **Console** (F12 → Console) |
| Server Action / formulario | Enviar el formulario y observar respuesta en pantalla; si falla, revisar **terminal del servidor** (donde corre `npm run dev`) |
| Supabase DB | Supabase Dashboard → **Table Editor** o **SQL Editor** |
| Auth / sesión | Chrome DevTools → **Application** → Cookies → buscar `sb-*` |
| Middleware / redirecciones | Navegar a la ruta directamente en el navegador y observar a dónde redirige |
| Variables de entorno | Terminal: `echo $NOMBRE_VARIABLE` o revisar Vercel → Settings → Environment Variables |
| Stripe Webhook | Terminal con `stripe listen` activo → observar los logs de eventos recibidos |
| Responsive / móvil | Chrome DevTools → icono de dispositivo (Ctrl+Shift+M) → seleccionar iPhone o similar |
| Accesibilidad | Chrome DevTools → pestaña **Lighthouse** → Accessibility, o extensión **axe DevTools** |

### Ejemplo de bloque de verificación bien escrito

```
🔍 Cómo verificar este cambio:

1. Arranca el servidor si no está corriendo:
   → Terminal: npm run dev

2. Abre http://localhost:3000/dashboard/admin/upload en Chrome
   → Debes ver el formulario de subida de lección (si eres admin)
   → Si no eres admin, debes ser redirigido a /dashboard ✅

3. Rellena el formulario con datos de prueba y pulsa Guardar:
   → En pantalla: mensaje verde "¡Lección creada correctamente!" ✅
   → En Supabase → Table Editor → tabla lessons: debe aparecer la fila ✅

4. Si aparece el mensaje rojo "La base de datos no está preparada":
   → El schema_v2.sql no se ha ejecutado todavía en Supabase ❌
   → Fix: Supabase Dashboard → SQL Editor → pegar y ejecutar supabase/schema_v2.sql

5. Si aparece "Error al guardar" sin más detalle:
   → Abre Chrome DevTools → Console (F12)
   → Mira el terminal donde corre npm run dev para el error exacto
```
