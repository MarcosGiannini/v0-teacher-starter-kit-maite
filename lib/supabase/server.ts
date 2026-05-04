import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getEnvVars(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || url === 'your-project-url' || !key || key === 'your-anon-key') {
    console.warn(
      '[Super Teacher] ⚠️  Supabase no está configurado.\n' +
      'Añade los valores reales en .env.local:\n' +
      '  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n' +
      '  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...\n' +
      'Encuéntralos en: supabase.com/dashboard → Project Settings → API'
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
