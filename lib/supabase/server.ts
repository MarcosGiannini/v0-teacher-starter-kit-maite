import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getEnvVars(): { url: string; key: string } | null {
  // .trim() es crítico: evita fallos silenciosos por espacios de cola en .env.local o Vercel
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || url === 'your-project-url' || !key || key === 'your-anon-key') {
    console.warn(
      '[Super Teacher] ⚠️  Supabase no está configurado.\n' +
      'Añade los valores reales en .env.local:\n' +
      '  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n' +
      '  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_... o eyJ...\n' +
      'Encuéntralos en: supabase.com/dashboard → Project Settings → API'
    )
    return null
  }

  // Validar formato de URL
  if (!url.startsWith('https://')) {
    console.error('[Super Teacher] ❌ NEXT_PUBLIC_SUPABASE_URL inválida — debe empezar con https://', url)
    return null
  }

  // Validar formato de clave (JWT eyJ... o nuevo formato sb_publishable_...)
  const keyIsJwt        = key.startsWith('eyJ')
  const keyIsPublishable = key.startsWith('sb_publishable_')
  if (!keyIsJwt && !keyIsPublishable) {
    console.error(
      '[Super Teacher] ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY tiene formato inesperado.\n' +
      `  Longitud: ${key.length} | Primeros 20 chars: "${key.substring(0, 20)}"\n` +
      '  Esperado: empieza con "eyJ" (JWT) o "sb_publishable_" (nuevo formato Supabase)'
    )
    return null
  }

  return { url, key }
}

export async function createClient() {
  const vars = getEnvVars()
  if (!vars) return null
  const { url, key } = vars
  const cookieStore = await cookies()

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll puede ser llamado desde un Server Component de solo lectura.
            // Se ignora aquí; el middleware se encargará de refrescar la sesión.
          }
        },
      },
    }
  )
}
