# Guía de Deploy en Vercel — Super Teacher

## Pasos

1. Empuja el código a GitHub (si no lo has hecho aún):
   ```bash
   git push origin main
   ```

2. Ve a [vercel.com](https://vercel.com) → **Add New Project** → importa el repositorio.

3. En la pantalla de configuración, ve a **Environment Variables** y añade **todas** las variables de abajo antes de hacer clic en "Deploy".

---

## Variables de Entorno (Vercel → Settings → Environment Variables)

| Variable | Dónde encontrarla | Entornos |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` public | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` secret | Production, Preview |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys → Secret key | Production, Preview |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys → Publishable key | Production, Preview, Development |
| `STRIPE_PRICE_CAPSULAS_A1` | Stripe Dashboard → Products → Cápsulas A1/A2 → precio → ID (`price_...`) | Production, Preview |
| `STRIPE_PRICE_CURSOS_B1_CORNELIA` | Stripe Dashboard → Products → Cursos Cornelia → precio → ID (`price_...`) | Production, Preview |
| `STRIPE_PRICE_MENTORSHIP` | Stripe Dashboard → Products → Mentoría → precio → ID (`price_...`) | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | Ver paso 4 abajo | Production |
| `NEXT_PUBLIC_SITE_URL` | La URL de tu dominio, ej: `https://superteacher.es` | Production |

> **Nota de seguridad**: `SUPABASE_SERVICE_ROLE_KEY` y `STRIPE_SECRET_KEY` son secretos críticos.
> Márcalos como "Sensitive" en Vercel. Nunca los añadas a variables con prefijo `NEXT_PUBLIC_`.

---

## Paso 4 — Configurar el Webhook de Stripe en Producción

Una vez que Vercel haya hecho el primer deploy y tengas una URL pública:

1. Ve a [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Haz clic en **Add endpoint**
3. URL del endpoint: `https://TU-DOMINIO/api/webhooks/stripe`
4. Eventos a escuchar: `checkout.session.completed`
5. Después de crear el endpoint, copia el **Signing secret** (`whsec_...`)
6. Añade ese valor como `STRIPE_WEBHOOK_SECRET` en Vercel → Settings → Environment Variables
7. Redespliega (Vercel → Deployments → ... → Redeploy)

---

## Paso 5 — Tabla de Supabase (si no está creada)

Ejecuta este SQL en Supabase → SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status                 text NOT NULL DEFAULT 'inactive',
  plan_id                text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Checklist final antes de enviar el link a Maite

- [ ] Todas las variables de entorno configuradas en Vercel
- [ ] Webhook de Stripe apuntando a la URL de producción
- [ ] `STRIPE_WEBHOOK_SECRET` actualizado con el secreto de producción (no el de test)
- [ ] Tabla `subscriptions` creada en Supabase con el constraint `UNIQUE (user_id)`
- [ ] Número de WhatsApp real en `app/page.tsx` (busca `wa.me/34600000000`)
- [ ] Foto de Maite subida a `/public/maite.jpg` y `<Image>` añadido en `page.tsx`
- [ ] Dominio personalizado configurado en Vercel (opcional pero recomendado)
