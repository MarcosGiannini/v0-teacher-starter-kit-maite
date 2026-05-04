import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { BookOpen, Feather, Video, ArrowRight, Check, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT — cambia aquí los textos para traducir la página a otro idioma
// ─────────────────────────────────────────────────────────────────────────────
const CONTENT = {
  meta: {
    title: 'Aprende español con confianza',
    description:
      'Plataforma de membresía para aprender español online con Maite Colodrón. Vídeos, cursos y mentoría personalizada. Niveles A1–C1, preparación DELE/SIELE.',
  },
  hero: {
    badge: 'Aprende español con propósito',
    heading: ['Habla español con', 'confianza'],
    subheading: 'Clases y recursos de',
    subheadingName: 'Maite Colodrón',
    subheadingEnd: 'adaptados a tu nivel y ritmo de vida',
    ctaActive: 'Ir a mis materiales',
    ctaStart: 'Empezar ahora',
    ctaAccount: 'Mi cuenta',
    ctaLogin: 'Ya tengo cuenta',
    ctaPlans: 'Ver planes',
  },
  about: {
    label: 'Tu profesora',
    heading: 'Mucho más que gramática:',
    headingItalic: 'una inmersión en el español real',
    p1start: 'Soy Maite Colodrón. Tras más de 12 años acompañando a estudiantes de todo el mundo, he aprendido que hablar un idioma no es conjugar verbos,',
    p1italic: 'es habitar una cultura',
    p2: 'Mi método fusiona la rigurosidad lingüística con la historia y la literatura, eliminando los estereotipos para que aprendas a pensar en español. No busco que seas un turista, busco que seas un hablante con',
    p2italic: 'confianza y propósito',
    photoAlt: 'Foto de Maite Colodrón, profesora de español',
    photoPlaceholder: 'Foto de Maite',
  },
  pills: [
    'Niveles A1 a C1',
    'Clases en vídeo',
    'Material descargable',
    'Comunidad privada',
    'Certificaciones DELE/SIELE',
    'Mentoría 1-a-1',
  ],
  plans: [
    { title: 'Cápsulas A1/A2', desc: 'Cimientos sólidos. Píldoras de vídeo y material descargable para avanzar a tu ritmo.',               price: '19€/mes' },
    { title: 'Cornelia B1+',   desc: 'Inmersión cultural. Domina el español intermedio a través de la literatura y la actualidad.',        price: '49€/mes' },
    { title: 'Mentoría 1-a-1', desc: 'Fluidez total. Sesiones personalizadas para resolver dudas y acelerar tus resultados.',              price: '149€/mes' },
  ],
  cta: 'Ver todos los planes →',
  faq: {
    heading: 'Preguntas frecuentes',
    items: [
      { q: '¿Necesito conocimientos previos de español?',        a: 'No. Las Cápsulas A1 están diseñadas para empezar desde cero. Si ya tienes base, los Cursos B1 o Mentoría se adaptan a tu nivel.' },
      { q: '¿Puedo cancelar mi membresía en cualquier momento?', a: 'Sí, sin permanencia ni penalizaciones. Cancelas desde tu área de cliente y mantienes el acceso hasta el fin del período pagado.' },
      { q: '¿Qué diferencia hay entre los cursos y la mentoría?',a: 'Los cursos son contenido estructurado que sigues a tu ritmo. La Mentoría añade sesiones 1-a-1 con Maite, feedback personalizado y un plan diseñado para tus objetivos concretos.' },
      { q: '¿Los materiales están disponibles tras cancelar?',    a: 'Durante tu membresía activa tienes acceso completo. Al cancelar, el acceso se cierra al finalizar el ciclo de facturación.' },
      { q: '¿Se puede preparar el DELE con estos cursos?',       a: 'Sí. El contenido incluye práctica de las competencias que evalúa el DELE (comprensión, expresión oral y escrita). La Mentoría permite un plan de preparación específico al examen.' },
    ],
  },
  footer: {
    copy: '© 2026',
    brand: 'Super Teacher',
    author: '· Maite Colodrón',
    navPlans: 'Planes',
    navLogin: 'Acceder',
    navWhatsApp: 'Contacto vía WhatsApp',
  },
}

export const metadata: Metadata = {
  title: CONTENT.meta.title,
  description: CONTENT.meta.description,
}

const PLAN_ICONS = [Video, BookOpen, Feather]

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
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" aria-hidden="true" />

      <main className="relative mx-auto w-full max-w-screen-md px-4 sm:px-6 py-12 sm:py-16 md:py-28">

        {/* Hero */}
        <header className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-secondary/15 text-foreground/80 mb-8 sm:mb-10 border border-secondary/25">
            <Feather className="h-4 w-4 text-secondary-foreground" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-sm tracking-wide">{CONTENT.hero.badge}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 tracking-tight text-balance leading-tight">
            {CONTENT.hero.heading[0]}{" "}
            <span className="font-medium italic">{CONTENT.hero.heading[1]}</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto text-pretty mb-10">
            {CONTENT.hero.subheading}{" "}
            <span className="font-serif italic text-foreground">{CONTENT.hero.subheadingName}</span>{" "}
            {CONTENT.hero.subheadingEnd}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn && hasActiveSub ? (
              <Button asChild size="lg" className="w-full sm:w-auto bg-[oklch(0.72_0.12_75)] hover:bg-[oklch(0.68_0.14_75)] text-[oklch(0.22_0.025_45)] font-medium shadow-md hover:shadow-lg transition-all px-8 border border-[oklch(0.65_0.12_75)]">
                <Link href="/dashboard">
                  {CONTENT.hero.ctaActive}
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
            ) : isLoggedIn ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all px-8">
                  <Link href="/pricing">
                    {CONTENT.hero.ctaPlans}
                    <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-primary/25 text-foreground hover:bg-primary/8 px-8">
                  <Link href="/dashboard">{CONTENT.hero.ctaAccount}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all px-8">
                  <Link href="/signup">
                    {CONTENT.hero.ctaStart}
                    <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-primary/25 text-foreground hover:bg-primary/8 px-8">
                  <Link href="/login">{CONTENT.hero.ctaLogin}</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Sobre mí */}
        <section aria-labelledby="about-heading" className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center mb-20 sm:mb-24">
          <div className="space-y-5 order-2 md:order-1">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-primary/70">{CONTENT.about.label}</p>
            <h2 id="about-heading" className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground leading-snug">
              {CONTENT.about.heading}{" "}
              <span className="italic">{CONTENT.about.headingItalic}</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {CONTENT.about.p1start}{" "}
              <span className="font-serif italic text-foreground">{CONTENT.about.p1italic}</span>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {CONTENT.about.p2}{" "}
              <span className="font-serif italic text-foreground">{CONTENT.about.p2italic}</span>.
            </p>
          </div>

          {/* Placeholder foto */}
          <div
            role="img"
            aria-label={CONTENT.about.photoAlt}
            className="relative order-1 md:order-2 mx-auto w-full max-w-[260px] sm:max-w-xs aspect-[3/4] rounded-3xl bg-secondary/20 border border-secondary/30 overflow-hidden flex items-end justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 via-background/20 to-primary/8" aria-hidden="true" />
            <p className="relative z-10 pb-6 text-xs text-muted-foreground/50 tracking-widest uppercase">{CONTENT.about.photoPlaceholder}</p>
          </div>
        </section>

        {/* Feature pills */}
        <section aria-label="Características incluidas" className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-16 sm:mb-20">
          {CONTENT.pills.map((feat) => (
            <span
              key={feat}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-card/70 border border-border/30 text-sm text-foreground/70 backdrop-blur-sm"
            >
              <Check className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={2} aria-hidden="true" />
              {feat}
            </span>
          ))}
        </section>

        {/* Plans overview */}
        <section aria-labelledby="plans-heading" className="mb-16 sm:mb-20">
          <h2 id="plans-heading" className="sr-only">Planes disponibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {CONTENT.plans.map(({ title, desc, price }, i) => {
              const Icon = PLAN_ICONS[i]
              return (
                <Link
                  key={title}
                  href="/pricing"
                  aria-label={`Ver plan ${title} — ${price}`}
                  className="group bg-card/70 border border-border/30 rounded-2xl p-5 sm:p-6 backdrop-blur-sm text-center hover:border-primary/40 hover:shadow-lg hover:bg-card transition-all duration-300 grid grid-rows-[auto_1fr_auto] gap-4"
                >
                  <div className="mx-auto w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.25} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-normal text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                  <span className="inline-block text-sm font-medium text-primary border border-primary/20 rounded-full px-3 py-1 group-hover:bg-primary/8 transition-colors">{price}</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* CTA bottom */}
        <div className="text-center mb-20 sm:mb-24">
          <Button asChild variant="outline" className="border-primary/25 text-foreground hover:bg-primary/8">
            <Link href="/pricing">{CONTENT.cta}</Link>
          </Button>
        </div>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mb-16 sm:mb-20">
          <h2 id="faq-heading" className="font-serif text-2xl sm:text-3xl font-light text-center text-foreground mb-8 sm:mb-10">
            {CONTENT.faq.heading}
          </h2>
          <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
            {CONTENT.faq.items.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-card/60 border border-border/25 rounded-2xl px-5 sm:px-6 py-4 sm:py-5 cursor-pointer hover:border-primary/25 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 list-none text-foreground font-medium select-none text-sm sm:text-base">
                  {q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" strokeWidth={1.5} aria-hidden="true" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative py-8 sm:py-10 mt-6 sm:mt-8 border-t border-border/20">
        <div className="mx-auto w-full max-w-screen-md px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            {CONTENT.footer.copy}{" "}
            <span className="font-serif italic text-foreground">{CONTENT.footer.brand}</span>
            {" "}{CONTENT.footer.author}
          </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-primary transition-colors">{CONTENT.footer.navPlans}</Link>
            <Link href="/login"   className="hover:text-primary transition-colors">{CONTENT.footer.navLogin}</Link>
            <Link href="https://wa.me/34629580783" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{CONTENT.footer.navWhatsApp}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

