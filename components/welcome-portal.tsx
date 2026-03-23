"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Video, FileText, ImageIcon, Leaf } from "lucide-react"

export function WelcomePortal() {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle decorative element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <main className="relative container mx-auto px-6 py-16 md:py-24 max-w-5xl">
        {/* Header Section */}
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/20 text-foreground/80 mb-8 border border-secondary/30">
            <Leaf className="h-4 w-4 text-secondary" />
            <span className="text-sm tracking-wide">Tu espacio de creación</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground mb-5 tracking-tight text-balance">
            ¡Hola <span className="font-normal">Maite</span>!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
            Bienvenida al centro de creación de tu plataforma
          </p>
        </header>

        {/* Project Status Section */}
        <section className="max-w-2xl mx-auto mb-20">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-foreground tracking-wide">
                    Estado del Proyecto
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Seguimiento de tu progreso
                  </CardDescription>
                </div>
                <span className="text-2xl font-light text-primary">25%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <Progress value={25} className="h-2.5" />
              
              <div className="bg-primary/8 rounded-xl p-4 border border-primary/15">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    Fase 1: Recogida de Material
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-5">
                  Estamos reuniendo todo el contenido necesario para tu plataforma
                </p>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span className="text-primary font-medium">Fase 1</span>
                <span>Fase 2</span>
                <span>Fase 3</span>
                <span>Lanzamiento</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Cards Section */}
        <section>
          <h2 className="text-center text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] mb-10">
            ¿Qué te gustaría hacer hoy?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Clases */}
            <Card className="group relative border-border/40 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-primary/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-0 relative">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-primary/15 transition-all duration-300">
                  <Video className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-lg font-medium text-foreground tracking-wide">
                  Mis Clases
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm mt-1">
                  Vídeos y PDFs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 relative">
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Sube el contenido de tus formaciones para organizar tu plataforma.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all">
                  Subir contenido
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Textos */}
            <Card className="group relative border-border/40 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-secondary/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-0 relative">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-secondary/30 transition-all duration-300">
                  <FileText className="h-8 w-8 text-secondary-foreground" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-lg font-medium text-foreground tracking-wide">
                  Textos de la Web
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm mt-1">
                  Sobre mí, Cursos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 relative">
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Escribe los textos para cada sección de tu web.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-secondary/40 text-foreground hover:bg-secondary/15 hover:border-secondary/60 transition-all"
                >
                  Escribir ahora
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Inspiración Visual */}
            <Card className="group relative border-border/40 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-primary/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-0 relative">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-primary/15 transition-all duration-300">
                  <ImageIcon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-lg font-medium text-foreground tracking-wide">
                  Inspiración Visual
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm mt-1">
                  Fotos, Logos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 relative">
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Comparte imágenes o referencias para definir el estilo.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all"
                >
                  Compartir ideas
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative py-10 mt-16 border-t border-border/30">
        <p className="text-center text-sm text-muted-foreground tracking-wide">
          Desarrollado con <span className="text-primary">❤️</span> por Marcos | Meta: 10 de Abril
        </p>
      </footer>
    </div>
  )
}
