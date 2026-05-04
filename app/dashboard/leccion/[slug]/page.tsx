import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LessonNotes } from '@/components/lesson-notes'
import { BookOpen, Clock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

/**
 * Página de detalle de lección — PLACEHOLDER (Fase 5)
 *
 * Estado actual:
 *   - Protegida por auth (requiere suscripción activa)
 *   - Muestra un placeholder de vídeo y el componente LessonNotes (PoC localStorage)
 *   - Los datos de lección son estáticos — pendiente integrar con CMS o tabla `lessons`
 *
 * Evolución prevista (Fase 6):
 *   - Leer lección real desde tabla `lessons` por `params.slug`
 *   - Integrar player de vídeo (Vimeo/YouTube embed o CMS)
 *   - Persistir apuntes en tabla `user_notes` (schema en supabase/schema_v2.sql)
 */

// Placeholder data — se reemplazará por fetch real a CMS o tabla lessons
const PLACEHOLDER_LESSON = {
  id: 'lesson-placeholder',
  slug: 'a1-01-presentaciones',
  title: 'Lección 1 — Presentaciones en español',
  description: 'Aprende a presentarte en español con confianza: nombre, origen, profesión y gustos personales.',
  duration: '8 min',
  plan: 'Cápsulas A1/A2',
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  if (!supabase) redirect('/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar suscripción activa
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!sub) redirect('/pricing')

  // TODO (Fase 6): obtener lección real por slug
  // const { data: lesson } = await supabase
  //   .from('lessons')
  //   .select('*')
  //   .eq('slug', slug)
  //   .single()
  // if (!lesson) notFound()

  const lesson = { ...PLACEHOLDER_LESSON, slug }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Breadcrumb */}
        <nav aria-label="Navegación" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Mi área
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground truncate">{lesson.title}</span>
        </nav>

        {/* Lesson header */}
        <header className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <span>{lesson.plan}</span>
            <span aria-hidden="true">·</span>
            <Clock className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
            <span>{lesson.duration}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground leading-snug">
            {lesson.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed">{lesson.description}</p>
        </header>

        {/* Video placeholder */}
        <div
          role="img"
          aria-label={`Vídeo de la lección: ${lesson.title}`}
          className="relative w-full aspect-video rounded-2xl bg-secondary/20 border border-secondary/30 overflow-hidden flex flex-col items-center justify-center gap-3"
        >
          <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary fill-current ml-0.5" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground/60 tracking-wide">
            Vídeo disponible próximamente
          </p>
        </div>

        {/* Notes — PoC con localStorage */}
        <LessonNotes lessonId={lesson.slug} />

      </div>
    </main>
  )
}
