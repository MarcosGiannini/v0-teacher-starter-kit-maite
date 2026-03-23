"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, FileText, Image, Sparkles } from "lucide-react"

export function WelcomePortal() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Header Section */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 text-secondary-foreground mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Tu espacio personal</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-4 text-balance">
            ¡Hola Maite!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            Bienvenida al centro de creación de tu plataforma
          </p>
        </header>

        {/* Project Status Section */}
        <section className="max-w-2xl mx-auto mb-16">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-foreground">
                Estado del Proyecto
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Seguimiento de tu progreso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">
                  Fase 1: Recogida de Material
                </span>
                <span className="text-muted-foreground">25%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: "25%" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-2">
                <span>Inicio</span>
                <span className="text-primary font-medium">← Estamos aquí</span>
                <span>Fase 2</span>
                <span>Fase 3</span>
                <span>Lanzamiento</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Cards Section */}
        <section className="max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
            ¿Qué te gustaría hacer hoy?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Clases */}
            <Card className="group border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Video className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium text-foreground">
                  Mis Clases
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Vídeos y PDFs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Sube el contenido de tus formaciones para que lo organicemos en tu plataforma.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Subir contenido
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Textos */}
            <Card className="group border-border/60 shadow-sm hover:shadow-md hover:border-secondary/50 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center mb-4 group-hover:bg-secondary/40 transition-colors">
                  <FileText className="h-7 w-7 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg font-medium text-foreground">
                  Textos de la Web
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Sobre mí, Cursos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Escribe o comparte los textos que quieres mostrar en cada sección de tu web.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-secondary/50 text-foreground hover:bg-secondary/20 hover:border-secondary"
                >
                  Escribir ahora
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Inspiración Visual */}
            <Card className="group border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Image className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium text-foreground">
                  Inspiración Visual
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Fotos, Logos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Comparte imágenes, referencias visuales o tu logo para definir el estilo.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50"
                >
                  Compartir ideas
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-border/40">
        <p className="text-center text-sm text-muted-foreground">
          Desarrollado con ❤️ por Marcos | Meta: 10 de Abril
        </p>
      </footer>
    </div>
  )
}
