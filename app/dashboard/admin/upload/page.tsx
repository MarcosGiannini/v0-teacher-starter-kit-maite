'use client'

/**
 * Admin Upload Page — /dashboard/admin/upload
 *
 * Formulario para que Maite inserte nuevas lecciones en la tabla `lessons`.
 * Acceso restringido: solo usuarios con app_metadata.role === 'admin' (middleware).
 *
 * Usa useActionState para mostrar feedback sin recarga de página.
 */

import { useActionState, useEffect, useRef } from 'react'
import { createLesson, type CreateLessonState } from '@/app/actions/create-lesson'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookOpen, CheckCircle2, AlertCircle, Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const INITIAL_STATE: CreateLessonState = { success: false }

const PLAN_OPTIONS = [
  { value: 'capsulas-a1',        label: 'Cápsulas A1/A2' },
  { value: 'cursos-b1-cornelia', label: 'Curso B1+ — Cornelia' },
  { value: 'mentorship',         label: 'Mentoría 1-a-1' },
] as const

export default function AdminUploadPage() {
  const [state, formAction, isPending] = useActionState(createLesson, INITIAL_STATE)
  const formRef = useRef<HTMLFormElement>(null)

  // Limpiar formulario al guardar con éxito
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  function fieldError(name: string) {
    return state.fieldErrors?.[name]
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">

        {/* Nav */}
        <nav aria-label="Navegación" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Mi área
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">Subir lección</span>
        </nav>

        {/* Card principal */}
        <Card className="border-border/25 bg-card/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="font-serif text-2xl font-light">Nueva lección</CardTitle>
                  <CardDescription className="mt-0.5">
                    Completa los datos para añadir una lección al catálogo
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 text-primary border-primary/30 bg-primary/5">
                Admin
              </Badge>
            </div>
          </CardHeader>

          <Separator className="mb-6 opacity-40" />

          <CardContent>
            {/* Feedback global: éxito */}
            {state.success && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-4 py-3 mb-6"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                  ¡Lección creada correctamente! El formulario se ha limpiado.
                </p>
              </div>
            )}

            {/* Feedback global: error */}
            {!state.success && state.error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 px-4 py-3 mb-6"
              >
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-700 dark:text-red-300">{state.error}</p>
              </div>
            )}

            <form ref={formRef} action={formAction} className="space-y-6" noValidate>

              {/* Título */}
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Título <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="ej. Lección 1 — Presentaciones en español"
                  maxLength={200}
                  required
                  aria-describedby={fieldError('title') ? 'title-error' : undefined}
                  aria-invalid={!!fieldError('title')}
                  className={fieldError('title') ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                />
                {fieldError('title') && (
                  <p id="title-error" role="alert" className="text-xs text-destructive">{fieldError('title')}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="ml-2 font-normal text-muted-foreground/70 text-xs">(URL única, sin espacios)</span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="ej. a1-01-presentaciones"
                  maxLength={120}
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  aria-describedby="slug-hint slug-error"
                  aria-invalid={!!fieldError('slug')}
                  className={fieldError('slug') ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                />
                <p id="slug-hint" className="text-xs text-muted-foreground/60">
                  Solo minúsculas, números y guiones. Ejemplo: <code className="font-mono">a1-01-presentaciones</code>
                </p>
                {fieldError('slug') && (
                  <p id="slug-error" role="alert" className="text-xs text-destructive">{fieldError('slug')}</p>
                )}
              </div>

              {/* Nivel + Orden (fila) */}
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="plan_id">
                    Nivel / Plan <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Select name="plan_id" required>
                    <SelectTrigger
                      id="plan_id"
                      aria-invalid={!!fieldError('plan_id')}
                      className={fieldError('plan_id') ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Seleccionar nivel…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError('plan_id') && (
                    <p role="alert" className="text-xs text-destructive">{fieldError('plan_id')}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="order_index">Orden en el plan</Label>
                  <Input
                    id="order_index"
                    name="order_index"
                    type="number"
                    min={1}
                    defaultValue={1}
                    aria-describedby={fieldError('order_index') ? 'order-error' : undefined}
                    aria-invalid={!!fieldError('order_index')}
                    className={fieldError('order_index') ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                  />
                  {fieldError('order_index') && (
                    <p id="order-error" role="alert" className="text-xs text-destructive">{fieldError('order_index')}</p>
                  )}
                </div>
              </div>

              {/* URL del vídeo */}
              <div className="space-y-1.5">
                <Label htmlFor="video_url">URL del vídeo</Label>
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  placeholder="https://vimeo.com/… o https://youtube.com/…"
                  aria-describedby={fieldError('video_url') ? 'video-error' : undefined}
                  aria-invalid={!!fieldError('video_url')}
                  className={fieldError('video_url') ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                />
                {fieldError('video_url') && (
                  <p id="video-error" role="alert" className="text-xs text-destructive">{fieldError('video_url')}</p>
                )}
              </div>

              {/* Duración */}
              <div className="space-y-1.5">
                <Label htmlFor="duration_s">
                  Duración
                  <span className="ml-2 font-normal text-muted-foreground/70 text-xs">(segundos, opcional)</span>
                </Label>
                <Input
                  id="duration_s"
                  name="duration_s"
                  type="number"
                  min={0}
                  placeholder="ej. 480 → 8 min"
                  aria-describedby={fieldError('duration_s') ? 'duration-error' : undefined}
                  aria-invalid={!!fieldError('duration_s')}
                  className={fieldError('duration_s') ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                />
                {fieldError('duration_s') && (
                  <p id="duration-error" role="alert" className="text-xs text-destructive">{fieldError('duration_s')}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Breve descripción de lo que aprenderá el alumno en esta lección…"
                  className="resize-y"
                />
              </div>

              {/* Preview checkbox */}
              <div className="flex items-start gap-3 rounded-xl border border-border/25 bg-muted/30 px-4 py-3">
                <input
                  id="is_preview"
                  name="is_preview"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border accent-primary cursor-pointer"
                />
                <div>
                  <Label htmlFor="is_preview" className="cursor-pointer">
                    Lección de previsualización gratuita
                  </Label>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Si está marcada, esta lección será visible sin suscripción activa
                  </p>
                </div>
              </div>

              <Separator className="opacity-30" />

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => formRef.current?.reset()}
                  disabled={isPending}
                  className="border-border/30"
                >
                  Limpiar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Guardando…
                    </>
                  ) : (
                    'Publicar lección'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
