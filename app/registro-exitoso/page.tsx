import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegistroExitosoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-serif text-4xl font-light tracking-wide text-foreground">
            Super Teacher
          </h1>
        </div>

        {/* Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="font-serif text-2xl font-light text-foreground">
              ¡Bienvenida/o a la comunidad de Maite!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Tu cuenta ha sido creada con éxito. Revisa tu email para
              confirmarla y pulsa el botón de abajo para entrar.
            </p>

            <Button
              asChild
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/login">Ir a iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
