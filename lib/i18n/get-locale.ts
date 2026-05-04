import { cookies } from 'next/headers'
import type { Locale } from './translations'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get('locale')?.value
  return value === 'en' ? 'en' : 'es'
}
