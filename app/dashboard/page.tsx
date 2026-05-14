import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const PLAN_LABELS: Record<string, string> = {
  'capsulas-a1': 'Cápsulas A1/A2',
  'cursos-b1-cornelia': 'B1+ con Cornelia',
  'mentorship': 'Mentoría 1-a-1',
}

interface LessonRow {
  id: string
  slug: string
  title: string
  description: string | null
  plan_id: string
  order_index: number
}

export default async function DashboardPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch paralelo: perfil, suscripción activa y lecciones
  const [{ data: profile }, { data: subscription }, { data: lessons }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('status, plan_id, current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
    supabase
      .from('lessons')
      .select('id, slug, title, description, plan_id, order_index')
      .order('order_index', { ascending: true }),
  ])

  const displayName = profile?.full_name || user.email
  const hasActiveSubscription = !!subscription
  const lessonList: LessonRow[] = lessons ?? []

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="font-serif text-4xl font-light tracking-wide text-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Super Teacher</Link>
            </h1>
            <p className="text-sm text-muted-foreground">
              Tu plataforma de membresía
            </p>
          </div>

          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Cerrar sesión
            </Button>
          </form>
        </div>

        {/* Welcome card */}
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-2xl font-light text-foreground">
              ¡Bienvenida/o de nuevo, {displayName}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasActiveSubscription ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tienes acceso completo a tu área privada. Continúa aprendiendo desde donde lo dejaste.
              </p>
            ) : (
              <div className="rounded-lg border border-border bg-secondary/30 px-5 py-4">
                <p className="text-sm font-medium text-foreground">
                  Tu membresía está pendiente
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Suscríbete para acceder a las lecciones y todo el contenido.
                </p>
                <Button
                  asChild
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                >
                  <a href="/pricing">Ver planes</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listado de lecciones — solo para suscriptores activos */}
        {hasActiveSubscription && (
          <section aria-labelledby="lessons-heading">

            {/* Encabezado de sección */}
            <div className="mb-6">
              <h2
                id="lessons-heading"
                className="font-serif text-2xl font-light text-foreground"
              >
                Tus lecciones
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Accede a tu contenido y continúa aprendiendo
              </p>
            </div>

            {lessonList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-secondary/10 px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/40">
                  <BookOpen className="h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-foreground">Contenido en preparación</p>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Estamos preparando contenido para ti. Muy pronto tendrás aquí tus lecciones.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lessonList.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/dashboard/leccion/${lesson.slug}`}
                      className="group flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-card px-5 py-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-md"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Icono con contenedor */}
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/12 bg-primary/8">
                          <BookOpen className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-base font-medium text-foreground truncate leading-snug">
                            {lesson.title}
                          </p>
                          {/* Badge de nivel */}
                          <span className="mt-1.5 inline-flex items-center rounded-full border border-secondary/40 bg-secondary/30 px-2.5 py-0.5 text-xs text-foreground/60">
                            {PLAN_LABELS[lesson.plan_id] ?? lesson.plan_id}
                          </span>
                          {lesson.description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <ArrowRight
                        className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

      </div>
    </main>
  )
}
