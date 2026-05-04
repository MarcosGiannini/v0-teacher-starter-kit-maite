import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch paralelo: perfil y suscripción activa
  const [{ data: profile }, { data: subscription }] = await Promise.all([
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
  ])

  const displayName = profile?.full_name || user.email
  const hasActiveSubscription = !!subscription

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="font-serif text-4xl font-light tracking-wide text-foreground">
              Super Teacher
            </h1>
            <p className="text-muted-foreground">
              Tu plataforma de membresía
            </p>
          </div>

          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Cerrar sesión
            </Button>
          </form>
        </div>

        {/* Welcome card */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-light text-foreground">
              ¡Bienvenida/o de nuevo, {displayName}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasActiveSubscription ? (
              <p className="text-muted-foreground">
                Estás dentro de tu área privada. Aquí aparecerá el contenido de
                tu membresía en cuanto esté disponible.
              </p>
            ) : (
              <div className="rounded-md border border-border bg-secondary/40 px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  Tu membresía está pendiente
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ¡Suscríbete para ver las lecciones y acceder a todo el contenido!
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

      </div>
    </main>
  )
}
