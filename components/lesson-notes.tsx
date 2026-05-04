'use client'

/**
 * LessonNotes — Componente de apuntes por lección
 *
 * ESTADO ACTUAL (Fase 5 — Proof of Concept):
 *   Los apuntes se guardan en localStorage bajo la clave `notes:${lessonId}`.
 *   No requiere autenticación ni llamadas a la API.
 *
 * EVOLUCIÓN PREVISTA (Fase 6 — Producción):
 *   1. Reemplazar localStorage por una llamada a Supabase:
 *        upsert({ user_id, lesson_id, content }) en tabla `user_notes`
 *   2. Añadir debounce (≥800 ms) en handleChange para evitar escrituras excesivas
 *   3. Mostrar indicador de estado: "Guardando…" / "Guardado ✓" / "Error"
 *   4. El esquema de base de datos ya está en supabase/schema_v2.sql
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { NotebookPen, Save } from 'lucide-react'

interface LessonNotesProps {
  /** ID único de la lección (para aislar las notas en localStorage) */
  lessonId: string
  /** Textos para i18n */
  labels?: {
    heading: string
    placeholder: string
    savedAt: string
    localStorageNote: string
  }
}

const DEFAULT_LABELS = {
  heading: 'Mis apuntes',
  placeholder: 'Escribe aquí tus notas sobre esta lección…',
  savedAt: 'Guardado',
  localStorageNote: 'Guardado localmente en este dispositivo (PoC)',
}

const STORAGE_KEY_PREFIX = 'super-teacher:notes:'
const AUTOSAVE_DELAY_MS  = 600

export function LessonNotes({ lessonId, labels = DEFAULT_LABELS }: LessonNotesProps) {
  const [content,   setContent]   = useState('')
  const [savedAt,   setSavedAt]   = useState<Date | null>(null)
  const [mounted,   setMounted]   = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storageKey  = `${STORAGE_KEY_PREFIX}${lessonId}`

  // Read from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    setMounted(true)
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) setContent(stored)
    } catch {
      // localStorage unavailable (private mode, permissions, etc.) — fail silently
    }
  }, [storageKey])

  const saveToStorage = useCallback((value: string) => {
    try {
      window.localStorage.setItem(storageKey, value)
      setSavedAt(new Date())
    } catch {
      // Ignore quota exceeded or unavailable storage
    }
  }, [storageKey])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setContent(value)

    // Debounced autosave
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveToStorage(value), AUTOSAVE_DELAY_MS)
  }

  // Cleanup debounce on unmount
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  if (!mounted) {
    // Skeleton placeholder to avoid layout shift
    return (
      <div className="rounded-2xl border border-border/25 bg-card/60 p-5 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-3" />
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    )
  }

  return (
    <section
      aria-labelledby="lesson-notes-heading"
      className="rounded-2xl border border-border/25 bg-card/60 backdrop-blur-sm p-5 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2
          id="lesson-notes-heading"
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <NotebookPen className="h-4 w-4 text-primary shrink-0" aria-hidden="true" strokeWidth={1.5} />
          {labels.heading}
        </h2>

        {savedAt && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground" aria-live="polite">
            <Save className="h-3 w-3 shrink-0" aria-hidden="true" strokeWidth={1.5} />
            {labels.savedAt} {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        id={`notes-${lessonId}`}
        aria-label={labels.placeholder}
        value={content}
        onChange={handleChange}
        placeholder={labels.placeholder}
        rows={6}
        className={[
          'w-full resize-y rounded-xl px-4 py-3 text-sm leading-relaxed',
          'bg-background/60 border border-border/30',
          'text-foreground placeholder:text-muted-foreground/50',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          'transition-colors',
        ].join(' ')}
      />

      {/* localStorage disclaimer */}
      <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" aria-hidden="true" />
        {labels.localStorageNote}
      </p>
    </section>
  )
}
