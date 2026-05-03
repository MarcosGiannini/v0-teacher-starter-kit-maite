import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
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
  return createBrowserClient(url, key)
}
