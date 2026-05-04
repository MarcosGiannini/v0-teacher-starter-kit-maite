import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/app/auth/actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-serif text-4xl font-light tracking-wide text-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Super Teacher</Link>
          </h1>
          <p className="text-sm text-muted-foreground">
            Bienvenida de nuevo, Maite
          </p>
        </div>

        {/* Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="font-serif text-2xl font-light text-foreground">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Accede a tu plataforma de membresía
            </CardDescription>
          </CardHeader>

          <CardContent>
            {message && (
              <p className="mb-4 rounded-md bg-accent/20 px-3 py-2 text-sm text-accent-foreground">
                {message}
              </p>
            )}
            {error && (
              <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  autoComplete="email"
                  className="bg-input border-border focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="bg-input border-border focus-visible:ring-ring"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Entrar
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link
                href="/signup"
                className="text-primary underline-offset-4 hover:underline font-medium"
              >
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Back to home */}
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  )
}
