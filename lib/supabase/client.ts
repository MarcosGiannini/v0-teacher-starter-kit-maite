import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
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

  if (!url.startsWith('https://')) {
    console.error('[Super Teacher] ❌ NEXT_PUBLIC_SUPABASE_URL inválida (client):', url)
    return null
  }

  return createBrowserClient(url, key)
}
