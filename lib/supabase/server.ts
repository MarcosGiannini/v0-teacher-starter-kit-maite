import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || url === 'your-project-url') {
    throw new Error(
      '[Super Teacher] Falta NEXT_PUBLIC_SUPABASE_URL en .env.local\n' +
      'Encuéntrala en: supabase.com/dashboard → Project Settings → API'
    )
  }
  if (!key || key === 'your-anon-key') {
    throw new Error(
      '[Super Teacher] Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local\n' +
      'Encuéntrala en: supabase.com/dashboard → Project Settings → API'
    )
  }
  return { url, key }
}

export async function createClient() {
  const { url, key } = getEnvVars()
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
