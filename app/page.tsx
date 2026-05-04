import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Sparkles, BookOpen, Users, ArrowRight, Check, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aprende español con confianza',
  description:
    'Plataforma de membresía para aprender español online con Maite Colodrón. Vídeos, cursos y mentoría personalizada. Niveles A1–C1, preparación DELE/SIELE.',
}

export default async function Page() {
  const supabase = await createClient()
  let isLoggedIn = false
  let hasActiveSub = false

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user

    if (user) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
      hasActiveSub = !!sub
    }
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
            {isLoggedIn && hasActiveSub ? (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all px-8">
                <Link href="/dashboard">
                  Continuar aprendiendo
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
            ) : isLoggedIn ? (
              <>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all px-8">
                  <Link href="/pricing">
                    Ver planes
                    <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary/25 text-foreground hover:bg-primary/8 px-8">
                  <Link href="/dashboard">Mi cuenta</Link>
                </Button>
              </>
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

        {/* Sobre mí */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-5">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-primary/70">Tu Super Teacher</p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground leading-snug">
              Conoce a{" "}
              <span className="italic">Maite Colodrón</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Soy profesora de Español como Lengua Extranjera con más de doce años acompañando a personas
              de todo el mundo que quieren comunicarse con autenticidad — no solo conjugar verbos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Mi método combina lingüística, cultura e historia para que el idioma cobre vida. Mis alumnos
              no aprenden español: aprenden a <span className="font-serif italic text-foreground">pensar en español</span>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Colodrón Bestuer es mi apellido completo — y mi compromiso con una enseñanza rigurosa,
              cercana y sin estereotipos.
            </p>
          </div>

          {/* Placeholder foto */}
          <div className="relative mx-auto w-full max-w-xs aspect-[3/4] rounded-3xl bg-secondary/20 border border-secondary/30 overflow-hidden flex items-end justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/8" />
            <p className="relative z-10 pb-6 text-xs text-muted-foreground/60 tracking-widest uppercase">Foto de Maite</p>
          </div>
        </section>

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
            { icon: Users,    title: "Cápsulas A1/A2",    desc: "Cápsulas de aprendizaje autónomo con vídeo y PDFs.",                              price: "19€/mes",  plan: "capsulas-a1" },
            { icon: BookOpen, title: "Cursos Cornelia B1",  desc: "Cursos de cultura, historia y literatura con enfoque conversacional.",          price: "49€/mes",  plan: "cursos-b1-cornelia" },
            { icon: Sparkles, title: "Mentorship",          desc: "Plan 100% personalizado con sesiones 1-a-1 y seguimiento continuo.",             price: "149€/mes", plan: "mentorship" },
          ].map(({ icon: Icon, title, desc, price, plan }) => (
            <Link
              key={title}
              href={`/pricing`}
              className="group bg-card/70 border border-border/30 rounded-2xl p-6 backdrop-blur-sm text-center hover:border-primary/40 hover:shadow-lg hover:bg-card transition-all duration-300 block"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.25} />
              </div>
              <h3 className="font-serif text-lg font-normal text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
              <span className="inline-block text-sm font-medium text-primary border border-primary/20 rounded-full px-3 py-1 group-hover:bg-primary/8 transition-colors">{price}</span>
            </Link>
          ))}
        </section>

        {/* CTA bottom */}
        <div className="text-center mb-24">
          <Button asChild variant="outline" className="border-primary/25 text-foreground hover:bg-primary/8">
            <Link href="/pricing">Ver todos los planes →</Link>
          </Button>
        </div>

        {/* FAQ */}
        <section className="mb-20">
          <h2 className="font-serif text-3xl font-light text-center text-foreground mb-10">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              {
                q: "¿Necesito conocimientos previos de español?",
                a: "No. Las Cápsulas A1 están diseñadas para empezar desde cero. Si ya tienes base, los Cursos B1 o Mentorship se adaptan a tu nivel.",
              },
              {
                q: "¿Puedo cancelar mi membresía en cualquier momento?",
                a: "Sí, sin permanencia ni penalizaciones. Cancelas desde tu área de cliente y mantienes el acceso hasta el fin del período pagado.",
              },
              {
                q: "¿Qué diferencia hay entre los cursos y la mentoría?",
                a: "Los cursos son contenido estructurado que sigues a tu ritmo. La Mentoría añade sesiones 1-a-1 con Maite, feedback personalizado y un plan diseñado para tus objetivos concretos.",
              },
              {
                q: "¿Los materiales están disponibles tras cancelar?",
                a: "Durante tu membresía activa tienes acceso completo. Al cancelar, el acceso se cierra al finalizar el ciclo de facturación.",
              },
              {
                q: "¿Se puede preparar el DELE con estos cursos?",
                a: "Sí. El contenido incluye práctica de las competencias que evalúa el DELE (comprensión, expresión oral y escrita). La Mentoría permite un plan de preparación específico al examen.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group bg-card/60 border border-border/25 rounded-2xl px-6 py-5 cursor-pointer hover:border-primary/25 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 list-none text-foreground font-medium select-none">
                  {q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" strokeWidth={1.5} />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative py-10 mt-8 border-t border-border/20">
        <div className="container mx-auto px-6 max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026{" "}
            <span className="font-serif italic text-foreground">Super Teacher</span>
            {" "}· Maite Colodrón
          </p>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-primary transition-colors">Planes</Link>
            <Link href="/login"   className="hover:text-primary transition-colors">Acceder</Link>
            <Link href="/signup"  className="hover:text-primary transition-colors">Registrarse</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

