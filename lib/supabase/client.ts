import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
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
  return createBrowserClient(url, key)
}
