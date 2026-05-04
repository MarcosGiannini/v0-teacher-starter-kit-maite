import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, BookOpen, Users, Feather } from "lucide-react"
import Link from "next/link"

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT — cambia aquí los textos para traducir la página a otro idioma
// ─────────────────────────────────────────────────────────────────────────────
const CONTENT = {
  header: {
    badge: 'Elige tu camino',
    heading: ['Planes y', 'precios'],
    subheading: 'Aprende español con',
    subheadingName: 'Maite Colodrón',
    subheadingEnd: 'al ritmo que necesitas',
  },
  guarantee: 'Todos los planes incluyen',
  guaranteeHighlight: '7 días de prueba gratuita',
  guaranteeEnd: '. Sin permanencia, cancela cuando quieras.',
  footer: {
    back: '← Volver al portal',
    credit: 'Desarrollado con',
    creditBy: 'por Marcos',
  },
}

const plans = [
  {
    id: "capsulas-a1",
    icon: Users,
    label: "Acceso inicial",
    title: "Cápsulas A1/A2",
    subtitle: "Membresía A1/A2",
    price: "19",
    period: "/mes",
    description: "Cimientos sólidos. Píldoras de vídeo y material descargable para avanzar a tu ritmo.",
    features: [
      "Cápsulas de vídeo (5–10 min) semanales",
      "PDFs de vocabulario y gramática A1/A2",
      "Ejercicios de pronunciación",
      "Acceso a la comunidad privada",
      "Actualizaciones mensuales de contenido",
    ],
    cta: "Empezar ahora",
    ctaHref: "/api/checkout?plan=capsulas-a1",
    variant: "default" as const,
    highlight: false,
  },
  {
    id: "cursos-b1-cornelia",
    icon: BookOpen,
    label: "Más popular",
    title: "Cornelia B1+",
    subtitle: "Español intermedio",
    price: "49",
    period: "/mes",
    description: "Inmersión cultural. Domina el español intermedio a través de la literatura y la actualidad.",
    features: [
      "Todo lo incluido en Cápsulas A1",
      "Curso completo basado en Cornelia",
      "Lecturas de actualidad con análisis",
      "Sesiones de conversación en grupo (2×/mes)",
      "Corrección de textos escritos",
      "Material de examen DELE/SIELE B1",
    ],
    cta: "Quiero este plan",
    ctaHref: "/api/checkout?plan=cursos-b1-cornelia",
    variant: "featured" as const,
    highlight: true,
  },
  {
    id: "mentorship",
    icon: Feather,
    label: "Experiencia premium",
    title: "Mentoría 1-a-1",
    subtitle: "Acompañamiento personalizado",
    price: "149",
    period: "/mes",
    description: "Fluidez total. Sesiones personalizadas para resolver dudas y acelerar tus resultados.",
    features: [
      "Todo lo incluido en Cursos B1 Cornelia",
      "Sesiones 1-a-1 con Maite (4×/mes)",
      "Plan de estudio 100% personalizado",
      "Revisión detallada de tareas y escritura",
      "Soporte directo por WhatsApp",
      "Preparación intensiva para certificados oficiales",
    ],
    cta: "Solicitar plaza",
    ctaHref: "/api/checkout?plan=mentorship",
    variant: "outline" as const,
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" aria-hidden="true" />

      <main className="relative mx-auto w-full max-w-screen-lg px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        {/* Header */}
        <header className="text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-secondary/15 text-foreground/80 mb-8 sm:mb-10 border border-secondary/25">
            <Feather className="h-4 w-4 text-secondary-foreground" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-sm tracking-wide">{CONTENT.header.badge}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-foreground mb-6 tracking-tight text-balance leading-tight">
            {CONTENT.header.heading[0]}{" "}
            <span className="font-medium italic">{CONTENT.header.heading[1]}</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto text-pretty">
            {CONTENT.header.subheading}{" "}
            <span className="font-serif italic text-foreground">{CONTENT.header.subheadingName}</span>{" "}
            {CONTENT.header.subheadingEnd}
          </p>
        </header>

        {/* Pricing cards */}
        <section aria-labelledby="pricing-heading" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 items-stretch">
          <h2 id="pricing-heading" className="sr-only">Planes de membresía</h2>
          {plans.map((plan) => {
            const Icon = plan.icon
            const isFeatured = plan.variant === "featured"

            return (
              <Card
                key={plan.id}
                className={[
                  "group relative border-border/30 bg-card/70 backdrop-blur-sm shadow-md transition-all duration-500 overflow-hidden flex flex-col",
                  isFeatured
                    ? "border-primary/40 shadow-xl ring-1 ring-primary/20 md:scale-[1.02]"
                    : "hover:shadow-xl hover:border-primary/25",
                ].join(" ")}
              >
                {/* Featured glow */}
                {isFeatured && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/5 pointer-events-none" aria-hidden="true" />
                )}
                {!isFeatured && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />
                )}

                <CardHeader className="text-center pb-0 relative">
                  {/* Badge */}
                  <div
                    className={[
                      "inline-flex self-center items-center gap-1.5 px-3 py-1 rounded-full text-xs tracking-wide mb-4 border",
                      isFeatured
                        ? "bg-primary/15 text-primary border-primary/25 font-medium"
                        : "bg-secondary/12 text-foreground/70 border-secondary/20",
                    ].join(" ")}
                  >
                    {plan.label}
                  </div>

                  {/* Icon */}
                  <div
                    className={[
                      "mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                      isFeatured
                        ? "bg-primary/15 group-hover:bg-primary/20"
                        : "bg-primary/10 group-hover:scale-105 group-hover:bg-primary/15",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" strokeWidth={1.25} aria-hidden="true" />
                  </div>

                  <CardTitle className="font-serif text-xl sm:text-2xl font-normal text-foreground tracking-wide">
                    {plan.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">
                    {plan.subtitle}
                  </CardDescription>

                  {/* Price */}
                  <div className="mt-5 sm:mt-6 mb-1">
                    <span className="font-serif text-4xl sm:text-5xl font-light text-foreground">
                      {plan.price}€
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 sm:pt-5 relative flex flex-col flex-1 gap-5 sm:gap-6">
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 sm:space-y-2.5 flex-1" aria-label={`Características del plan ${plan.title}`}>
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className="h-4 w-4 text-primary mt-0.5 shrink-0"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span className="text-sm text-foreground/80 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    asChild
                    className={[
                      "w-full transition-all group/btn",
                      isFeatured
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
                        : "border-primary/25 text-foreground hover:bg-primary/8 hover:border-primary/40",
                    ].join(" ")}
                    variant={isFeatured ? "default" : "outline"}
                  >
                    <Link href={plan.ctaHref} aria-label={`${plan.cta} — Plan ${plan.title}`}>
                      {plan.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </section>

        {/* Guarantee note */}
        <p className="text-center text-sm text-muted-foreground mt-10 sm:mt-14 tracking-wide">
          {CONTENT.guarantee}{" "}
          <span className="text-foreground font-medium">{CONTENT.guaranteeHighlight}</span>
          {CONTENT.guaranteeEnd}
        </p>
      </main>

      {/* Footer */}
      <footer className="relative py-8 sm:py-12 mt-12 sm:mt-20 border-t border-border/20">
        <nav aria-label="Footer pricing" className="text-center text-sm text-muted-foreground tracking-wide">
          <Link href="/" className="hover:text-primary transition-colors">
            {CONTENT.footer.back}
          </Link>
          <span className="mx-4 text-border" aria-hidden="true">|</span>
          {CONTENT.footer.credit} <span className="text-primary" aria-hidden="true">&#10084;</span> {CONTENT.footer.creditBy}
        </nav>
      </footer>
    </div>
  )
}
