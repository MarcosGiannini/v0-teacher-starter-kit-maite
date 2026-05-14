import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { LessonNotes } from '@/components/lesson-notes'
import { BookOpen, Clock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

/** Forma de la fila de la tabla `lessons` que usamos en esta página */
interface LessonRow {
  id: string
  slug: string
  title: string
  description: string | null
  plan_id: string
  duration_s: number | null
  video_url: string | null
}

/**
 * Convierte una URL de YouTube o Vimeo en una URL embebible.
 * Devuelve null si el formato no es reconocido o la URL no es válida.
 * Solo acepta YouTube y Vimeo — no pasa URLs arbitrarias al iframe.
 */
function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)

    // YouTube: youtube.com/watch?v=ID
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    // YouTube: youtu.be/ID
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    // Vimeo: vimeo.com/NUMERIC_ID
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.slice(1)
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`
    }

    return null
  } catch {
    return null
  }
}

const PLAN_LABELS: Record<string, string> = {
  'capsulas-a1': 'Cápsulas A1/A2',
  'cursos-b1-cornelia': 'B1+ con Cornelia',
  'mentorship': 'Mentoría 1-a-1',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  return `${Math.round(seconds / 60)} min`
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

  // Obtener lección real desde la tabla `lessons`
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, slug, title, description, plan_id, duration_s, video_url')
    .eq('slug', slug)
    .single<LessonRow>()

  if (!lesson) notFound()

  const videoEmbedUrl = lesson.video_url ? getVideoEmbedUrl(lesson.video_url) : null

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
            <span>{PLAN_LABELS[lesson.plan_id] ?? lesson.plan_id}</span>
            {lesson.duration_s && (
              <>
                <span aria-hidden="true">·</span>
                <Clock className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
                <span>{formatDuration(lesson.duration_s)}</span>
              </>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground leading-snug">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-muted-foreground leading-relaxed">{lesson.description}</p>
          )}
        </header>

        {/* Vídeo — embed si hay URL, placeholder si no */}
        {videoEmbedUrl ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-secondary/30">
            <iframe
              src={videoEmbedUrl}
              title={`Vídeo: ${lesson.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : (
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
        )}

        {/* Apuntes persistidos en Supabase */}
        <LessonNotes lessonId={lesson.id} userId={user.id} />

      </div>
    </main>
  )
}
