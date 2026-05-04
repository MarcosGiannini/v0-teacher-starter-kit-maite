import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Sparkles, BookOpen, Users, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

export default async function Page() {
  const supabase = await createClient()
  let isLoggedIn = false
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <main className="relative container mx-auto px-6 py-16 md:py-28 max-w-4xl">

        {/* Hero */}
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-secondary/15 text-foreground/80 mb-10 border border-secondary/25">
            <Sparkles className="h-4 w-4 text-secondary-foreground" strokeWidth={1.5} />
            <span className="text-sm tracking-wide">Aprende español con propósito</span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 tracking-tight text-balance leading-tight">
            Habla español con{" "}
            <span className="font-medium italic">confianza</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto text-pretty mb-10">
            Clases y recursos de{" "}
            <span className="font-serif italic text-foreground">Maite Colodrón</span>{" "}
            adaptados a tu nivel y ritmo de vida
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all px-8">
                <Link href="/dashboard">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all px-8">
                  <Link href="/signup">
                    Empezar gratis
                    <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary/25 text-foreground hover:bg-primary/8 px-8">
                  <Link href="/login">Ya tengo cuenta</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Feature pills */}
        <section className="flex flex-wrap justify-center gap-3 mb-20">
          {[
            "Niveles A1 a C1",
            "Clases en vídeo",
            "Material descargable",
            "Comunidad privada",
            "Certificaciones DELE/SIELE",
            "Mentoría 1-a-1",
          ].map((feat) => (
            <span
              key={feat}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card/70 border border-border/30 text-sm text-foreground/70 backdrop-blur-sm"
            >
              <Check className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={2} />
              {feat}
            </span>
          ))}
        </section>

        {/* Plans overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Users,    title: "Cápsulas A1",       desc: "Vídeos breves + PDFs para empezar desde cero.",           price: "19€/mes" },
            { icon: BookOpen, title: "Cursos B1 Cornelia", desc: "Nivel intermedio con la novela Cornelia.",                price: "49€/mes" },
            { icon: Sparkles, title: "Mentorship",         desc: "Atención individualizada y plan 100% personalizado.",     price: "149€/mes" },
          ].map(({ icon: Icon, title, desc, price }) => (
            <div key={title} className="bg-card/70 border border-border/30 rounded-2xl p-6 backdrop-blur-sm text-center hover:border-primary/25 hover:shadow-lg transition-all duration-300">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.25} />
              </div>
              <h3 className="font-serif text-lg font-normal text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{desc}</p>
              <span className="text-sm font-medium text-primary">{price}</span>
            </div>
          ))}
        </section>

        {/* CTA bottom */}
        <div className="text-center">
          <Button asChild variant="outline" className="border-primary/25 text-foreground hover:bg-primary/8">
            <Link href="/pricing">Ver todos los planes →</Link>
          </Button>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative py-10 mt-8 border-t border-border/20">
        <p className="text-center text-sm text-muted-foreground tracking-wide">
          © 2026{" "}
          <span className="font-serif italic text-foreground">Super Teacher</span>
          {" "}· Maite Colodrón
          <span className="mx-4 text-border">|</span>
          <Link href="/pricing" className="hover:text-primary transition-colors">Planes</Link>
          <span className="mx-3 text-border">·</span>
          <Link href="/login" className="hover:text-primary transition-colors">Acceder</Link>
        </p>
      </footer>
    </div>
  )
}

