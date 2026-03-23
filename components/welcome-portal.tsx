"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Globe, Users, Camera, ArrowUpRight } from "lucide-react"

const TALLY_URLS = {
  membresia: "https://tally.so/r/GxLKWL?origen=membresia",
  cursosB1: "https://tally.so/r/GxLKWL?origen=cursos_b1",
  marca: "https://tally.so/r/GxLKWL?origen=marca",
}

export function WelcomePortal() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <main className="relative container mx-auto px-6 py-16 md:py-24 max-w-5xl">
        {/* Header Section */}
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-secondary/15 text-foreground/80 mb-10 border border-secondary/25">
            <Globe className="h-4 w-4 text-secondary" strokeWidth={1.5} />
            <span className="text-sm tracking-wide">Tu espacio de creación</span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6 tracking-tight text-balance leading-tight">
            ¡Hola <span className="font-medium italic">Maite</span>!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto text-pretty">
            Bienvenida al centro de creación de tu plataforma{" "}
            <span className="font-serif italic text-foreground">Super Teacher</span>
          </p>
        </header>

        {/* Project Status Section */}
        <section className="max-w-2xl mx-auto mb-24">
          <Card className="border-border/30 bg-card/70 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-foreground tracking-wide">
                    Estado del Proyecto
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Seguimiento de tu progreso
                  </CardDescription>
                </div>
                <span className="text-3xl font-serif font-light text-primary">25%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <Progress value={25} className="h-2" />
              
              <div className="bg-primary/8 rounded-xl p-5 border border-primary/12">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="font-serif text-base text-foreground">
                    Fase 1: Arquitectura y Recogida de Material
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2.5 ml-5 leading-relaxed">
                  Estamos construyendo los cimientos de tu plataforma educativa
                </p>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground pt-2 px-1">
                <span className="text-primary font-medium">Fase 1</span>
                <span>Diseño</span>
                <span>Desarrollo</span>
                <span>Lanzamiento</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Cards Section */}
        <section>
          <h2 className="text-center text-xs font-medium text-muted-foreground uppercase tracking-[0.25em] mb-12">
            Contenido de tu plataforma
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Membresía A1/A2 */}
            <Card className="group relative border-border/30 bg-card/70 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-0 relative">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-primary/15 transition-all duration-300">
                  <Users className="h-7 w-7 text-primary" strokeWidth={1.25} />
                </div>
                <CardTitle className="font-serif text-xl font-normal text-foreground tracking-wide">
                  Membresía A1/A2
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm mt-2">
                  Cápsulas de vídeo y PDFs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 relative">
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Material para tus estudiantes de nivel inicial: vídeos explicativos y recursos descargables.
                </p>
                <Button 
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all group/btn"
                >
                  <a href={TALLY_URLS.membresia} target="_blank" rel="noopener noreferrer">
                    Subir contenido
                    <ArrowUpRight className="ml-2 h-4 w-4 opacity-70 group-hover/btn:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Cursos B1 */}
            <Card className="group relative border-border/30 bg-card/70 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-secondary/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-0 relative">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/15 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-secondary/25 transition-all duration-300">
                  <BookOpen className="h-7 w-7 text-secondary-foreground" strokeWidth={1.25} />
                </div>
                <CardTitle className="font-serif text-xl font-normal text-foreground tracking-wide">
                  Cursos B1
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm mt-2">
                  Cornelia y Actualidad
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 relative">
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Contenido intermedio con enfoque cultural: literatura contemporánea y temas de actualidad.
                </p>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full border-secondary/35 text-foreground hover:bg-secondary/12 hover:border-secondary/50 transition-all group/btn"
                >
                  <a href={TALLY_URLS.cursosB1} target="_blank" rel="noopener noreferrer">
                    Subir contenido
                    <ArrowUpRight className="ml-2 h-4 w-4 opacity-70 group-hover/btn:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Sobre Mí e Inspiración */}
            <Card className="group relative border-border/30 bg-card/70 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-0 relative">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-primary/15 transition-all duration-300">
                  <Camera className="h-7 w-7 text-primary" strokeWidth={1.25} />
                </div>
                <CardTitle className="font-serif text-xl font-normal text-foreground tracking-wide">
                  Sobre Mí e Inspiración
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm mt-2">
                  Fotos y textos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 relative">
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Tu historia, tu esencia: comparte fotos profesionales y textos que reflejen tu identidad.
                </p>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full border-primary/25 text-foreground hover:bg-primary/8 hover:border-primary/40 transition-all group/btn"
                >
                  <a href={TALLY_URLS.marca} target="_blank" rel="noopener noreferrer">
                    Compartir material
                    <ArrowUpRight className="ml-2 h-4 w-4 opacity-70 group-hover/btn:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative py-12 mt-20 border-t border-border/20">
        <p className="text-center text-sm text-muted-foreground tracking-wide">
          Desarrollado con <span className="text-primary">&#10084;</span> por Marcos | Meta: 10 de Abril
        </p>
      </footer>
    </div>
  )
}
