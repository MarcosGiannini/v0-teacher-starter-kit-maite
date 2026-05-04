# Super Teacher · Plataforma de Membresía

> Aprende español online con **Maite Colodrón** — vídeos, cursos y mentoría personalizada de nivel A1 a C1.

---

## Descripción del proyecto

Super Teacher es una plataforma SaaS de membresía para aprender español online. Integra autenticación de usuarios (Supabase), pagos recurrentes (Stripe) y un área de contenidos protegida, todo construido con Next.js App Router.

La academia de Maite Colodrón combina rigurosidad lingüística con inmersión cultural — historia, literatura y actualidad — para llevar al alumno del A1 al dominio total del idioma.

---

## Stack técnica

| Capa            | Tecnología                                                                  |
|-----------------|-----------------------------------------------------------------------------|
| Framework       | Next.js 16 (App Router, Server Components, Server Actions, Turbopack)      |
| Lenguaje        | TypeScript 5                                                                |
| UI              | Tailwind CSS v4 · shadcn/ui · Lucide React                                 |
| Tipografía      | Cormorant Garamond (serif) · Inter (sans)                                   |
| Auth & DB       | Supabase (auth + PostgreSQL + RLS)                                          |
| Pagos           | Stripe Checkout Sessions + Webhooks                                         |
| i18n            | Traducciones centralizadas en `lib/i18n/` (ES / EN)                        |
| Tema            | next-themes (dark / light / system)                                         |
| Analytics       | Vercel Analytics                                                            |
| Deploy          | Vercel (rama `main` → producción automática)                                |

---

## Requisitos previos

- Node.js ≥ 20
- npm ≥ 10
- Cuenta Supabase (proyecto existente o nuevo)
- Cuenta Stripe (modo test para desarrollo)

---

## Guía de instalación rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/MarcosGiannini/v0-teacher-starter-kit-maite.git
cd v0-teacher-starter-kit-maite

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crea .env.local (ver sección Variables de entorno)

# 4. Arrancar en desarrollo
npm run dev
# → http://localhost:3000
```

### Escuchar webhooks de Stripe en local

```bash
# Instala la CLI de Stripe: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copia el "whsec_..." que imprime y ponlo en STRIPE_WEBHOOK_SECRET
```

---

## Variables de entorno

Crea un fichero `.env.local` en la raíz (nunca se commitea a Git):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# IDs de precios en Stripe
STRIPE_PRICE_CAPSULAS_A1=price_...
STRIPE_PRICE_CURSOS_B1_CORNELIA=price_...
STRIPE_PRICE_MENTORSHIP=price_...

# (Opcional) URL de producción para metadataBase
NEXT_PUBLIC_SITE_URL=https://superteacher.es
```

---

## Estructura de carpetas

```
├── app/
│   ├── actions/
│   │   └── set-locale.ts        # Server Action: cambio de idioma
│   ├── api/
│   │   ├── checkout/route.ts    # POST → Stripe Checkout Session
│   │   └── webhooks/stripe/     # POST → procesa eventos Stripe
│   ├── auth/actions.ts          # login / signup / logout (Server Actions)
│   ├── dashboard/               # Área privada (requiere auth + suscripción)
│   ├── login/                   # Formulario de acceso
│   ├── pricing/                 # Página pública de planes y precios
│   ├── registro-exitoso/        # Confirmación post-registro
│   ├── signup/                  # Formulario de registro
│   ├── layout.tsx               # Layout raíz (ThemeProvider, SiteControls, Analytics)
│   └── page.tsx                 # Landing page (Home)
│
├── components/
│   ├── site-controls.tsx        # Toggle tema + selector de idioma (client)
│   ├── theme-provider.tsx       # Wrapper de next-themes
│   └── ui/                      # Componentes shadcn/ui
│
├── lib/
│   ├── i18n/
│   │   ├── translations.ts      # Textos ES / EN para todas las páginas
│   │   └── get-locale.ts        # Lee cookie `locale` (server utility)
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   └── server.ts            # Server client (SSR)
│   └── utils.ts
│
├── middleware.ts                 # Protección de rutas + refresco de sesión
└── public/
```

---

## Flujo de pagos (Stripe)

```
Usuario → /pricing → CTA "Empezar ahora"
    → POST /api/checkout?plan=<id>
    → Stripe Checkout Session (hosted)
    → checkout.session.completed
    → POST /api/webhooks/stripe
    → INSERT/UPDATE subscriptions (Supabase)
    → usuario con suscripción activa
```

### Tabla `subscriptions` (Supabase)

```sql
CREATE TABLE subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id),
  stripe_customer_id     text,
  stripe_subscription_id text,
  price_id               text,
  status                 text NOT NULL DEFAULT 'inactive',
  created_at             timestamptz DEFAULT now(),
  CONSTRAINT subscriptions_user_id_key UNIQUE (user_id)
);
```

---

## Rutas protegidas

| Ruta         | Protección                                  |
|--------------|---------------------------------------------|
| `/dashboard` | Requiere sesión activa → redirect `/login`  |
| `/login`     | Si ya hay sesión → redirect `/dashboard`    |
| `/signup`    | Si ya hay sesión → redirect `/dashboard`    |

La lógica vive en `middleware.ts` (Edge Runtime compatible).

---

## i18n — Añadir un nuevo idioma

1. Abre `lib/i18n/translations.ts`
2. Duplica el bloque `es: { ... }` con la nueva clave (ej. `fr`)
3. Traduce todos los textos
4. Actualiza el tipo `Locale = 'es' | 'en'` para incluir la nueva clave
5. El sistema es cookie-based (`locale`) y funciona automáticamente

---

## Dark mode

El proyecto usa **next-themes** con la clase CSS `.dark`. Los tokens de color (OKLCH) están definidos tanto en `:root` como en `.dark` dentro de `app/globals.css`. El toggle aparece en la esquina superior derecha de todas las páginas junto al selector de idioma.

---

## Checklist de producción

- [ ] Reemplazar `STRIPE_WEBHOOK_SECRET` con el signing secret real (Stripe Dashboard → Webhooks)
- [ ] Crear endpoint webhook en Stripe → `https://superteacher.es/api/webhooks/stripe` (evento: `checkout.session.completed`)
- [ ] Añadir variables de entorno en Vercel (Settings → Environment Variables)
- [ ] Subir foto real de Maite (reemplazar placeholder en `app/page.tsx`)
- [ ] Ejecutar en Supabase SQL Editor: `ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);`
- [ ] Verificar Node.js 20.x en Vercel (Settings → General → Node.js Version)

---

## Licencia

Proyecto privado. Todos los derechos reservados © 2026 Maite Colodrón.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev.
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/MarcosGiannini/v0-teacher-starter-kit-maite" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
