import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Capa de seguridad extra: aunque el middleware ya redirige,
  // un Server Component nunca debe asumir que el usuario existe.
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email

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
              Bienvenida/o, {displayName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Estás dentro de tu área privada. Aquí aparecerá el contenido de
              tu membresía en cuanto esté disponible.
            </p>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
