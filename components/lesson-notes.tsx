'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { NotebookPen, Save, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LessonNotesProps {
  /** UUID de la lección (de tabla lessons.id) */
  lessonId: string
  /** UUID del usuario autenticado (del Server Component padre) */
  userId: string
  /** Textos para i18n */
  labels?: {
    heading: string
    placeholder: string
    saving: string
    saved: string
    error: string
  }
}

const DEFAULT_LABELS = {
  heading: 'Mis apuntes',
  placeholder: 'Escribe aquí tus notas sobre esta lección…',
  saving: 'Guardando…',
  saved: 'Guardado',
  error: 'Error al guardar',
}

const AUTOSAVE_DELAY_MS = 800

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function LessonNotes({ lessonId, userId, labels = DEFAULT_LABELS }: LessonNotesProps) {
  const [content,    setContent]    = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [savedAt,    setSavedAt]    = useState<Date | null>(null)
  const [mounted,    setMounted]    = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cargar apuntes existentes desde Supabase al montar
  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    if (!supabase) return

    supabase
      .from('user_notes')
      .select('content')
      .eq('lesson_id', lessonId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) setContent(data.content)
      })
  }, [lessonId, userId])

  const saveToSupabase = useCallback(async (value: string) => {
    const supabase = createClient()
    if (!supabase) return

    setSaveStatus('saving')

    const { error } = await supabase
      .from('user_notes')
      .upsert(
        { user_id: userId, lesson_id: lessonId, content: value },
        { onConflict: 'user_id,lesson_id' },
      )

    if (error) {
      setSaveStatus('error')
    } else {
      setSaveStatus('saved')
      setSavedAt(new Date())
    }
  }, [lessonId, userId])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setContent(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveToSupabase(value), AUTOSAVE_DELAY_MS)
  }

  // Limpiar debounce al desmontar
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  if (!mounted) {
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

        <span className="flex items-center gap-1 text-xs text-muted-foreground" aria-live="polite">
          {saveStatus === 'saving' && (
            <>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" aria-hidden="true" />
              {labels.saving}
            </>
          )}
          {saveStatus === 'saved' && savedAt && (
            <>
              <Save className="h-3 w-3 shrink-0" aria-hidden="true" strokeWidth={1.5} />
              {labels.saved} {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="h-3 w-3 shrink-0 text-destructive" aria-hidden="true" strokeWidth={1.5} />
              <span className="text-destructive">{labels.error}</span>
            </>
          )}
        </span>
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
    </section>
  )
}

