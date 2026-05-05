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

**Al terminar cualquier implementación, la IA SIEMPRE debe:**

1. **Ejecutar la verificación ella misma** — no delegar al usuario.
2. **Reportar el resultado real** obtenido, no instrucciones teóricas.
3. **Indicar al usuario solo lo que NO puede comprobarse desde el terminal** (UI visual, flujos de pago, sesiones de navegador).

---

### Qué ejecutar según el tipo de cambio

| Tipo de cambio | La IA ejecuta | Qué reporta |
|----------------|---------------|-------------|
| Cualquier cambio de código | `npm run dev` en modo async, leer salida | "Arranca sin errores" o "Error: [mensaje exacto]" |
| Errores de tipos TypeScript | `npx tsc --noEmit` | Lista de errores o "Sin errores de tipos" |
| Linting | `npx eslint <fichero>` | Warnings/errores o "Limpio" |
| Imports rotos / módulos | Leer salida de `npm run dev` | Reportar si hay `Module not found` |
| Variables de entorno | `echo $VARIABLE` en terminal | Confirmar si está definida (sin mostrar el valor) |
| Test si existen | `npm test` | Resultado de los tests |

### Lo que SÍ delega al usuario (no se puede automatizar desde terminal)

- Verificación visual de UI en el navegador
- Login / flujo de sesión real
- Pagos con tarjeta en Stripe
- Comportamiento en móvil
- Accesibilidad con lector de pantalla  

Para estos casos, la IA da instrucciones precisas:
**dónde ir + qué hacer + qué ver + qué NO ver**.

---

### Ejemplo de bloque de verificación bien escrito

```
🔍 Verificación ejecutada:

✅ npm run dev → arranca sin errores en http://localhost:3000
✅ TypeScript → sin errores de tipos en los ficheros modificados
✅ El fichero app/actions/create-lesson.ts compila correctamente

⚠️ Lo que debes comprobar tú en el navegador:
1. Abre http://localhost:3000/dashboard/admin/upload
   → Si eres admin: verás el formulario ✅
   → Si NO eres admin: serás redirigido a /dashboard ✅

2. Rellena el formulario y pulsa Guardar:
   → Mensaje verde en pantalla: "¡Lección creada correctamente!" ✅
   → Si aparece mensaje rojo "base de datos no preparada":
     Fix → Supabase Dashboard → SQL Editor → ejecutar supabase/schema_v2.sql
```
