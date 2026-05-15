'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setLocale } from '@/app/actions/set-locale'
import type { Locale } from '@/lib/i18n/translations'

interface SiteControlsProps {
  locale: Locale
  labels: {
    toDark: string
    toLight: string
    langEs: string
    langEn: string
  }
}

export function SiteControls({ locale, labels }: SiteControlsProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Avoid hydration mismatch — only render theme icon after mount
  useEffect(() => setMounted(true), [])

  function handleLocale(next: Locale) {
    if (next === locale || isPending) return
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  // Use resolvedTheme (not theme) so that defaultTheme="system" resolves correctly.
  // When theme='system' and the OS is dark, theme==='dark' would be false (wrong).
  const isDark = resolvedTheme === 'dark'

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 bg-card/90 backdrop-blur-md border border-border/40 rounded-full px-3 py-1.5 shadow-sm"
      role="toolbar"
      aria-label={locale === 'es' ? 'Controles de apariencia' : 'Appearance controls'}
    >
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={mounted ? (isDark ? labels.toLight : labels.toDark) : labels.toDark}
        className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {mounted ? (
          isDark
            ? <Sun  className="h-3.5 w-3.5" aria-hidden="true" />
            : <Moon className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Moon className="h-3.5 w-3.5 opacity-0" aria-hidden="true" />
        )}
      </button>

      <span className="h-3 w-px bg-border/60" aria-hidden="true" />

      {/* Language switcher */}
      <div className="flex items-center" role="group" aria-label={locale === 'es' ? 'Selector de idioma' : 'Language selector'}>
        <button
          onClick={() => handleLocale('es')}
          disabled={isPending || locale === 'es'}
          aria-label={labels.langEs}
          aria-pressed={locale === 'es'}
          className={[
            'px-1.5 py-0.5 rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            locale === 'es'
              ? 'text-primary cursor-default'
              : 'text-muted-foreground hover:text-foreground',
            isPending ? 'opacity-50' : '',
          ].join(' ')}
        >
          ES
        </button>
        <span className="text-border/60 text-xs select-none" aria-hidden="true">·</span>
        <button
          onClick={() => handleLocale('en')}
          disabled={isPending || locale === 'en'}
          aria-label={labels.langEn}
          aria-pressed={locale === 'en'}
          className={[
            'px-1.5 py-0.5 rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            locale === 'en'
              ? 'text-primary cursor-default'
              : 'text-muted-foreground hover:text-foreground',
            isPending ? 'opacity-50' : '',
          ].join(' ')}
        >
          EN
        </button>
      </div>
    </div>
  )
}
