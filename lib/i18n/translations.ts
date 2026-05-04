// ─────────────────────────────────────────────────────────────────────────────
// Traducciones centralizadas ES / EN
// Para añadir un idioma nuevo: duplica el bloque y cambia la clave.
// ─────────────────────────────────────────────────────────────────────────────

export type Locale = 'es' | 'en'

export const translations = {
  // ── ESPAÑOL ────────────────────────────────────────────────────────────────
  es: {
    home: {
      meta: {
        title: 'Aprende español con confianza',
        description:
          'Plataforma de membresía para aprender español online con Maite Colodrón. Vídeos, cursos y mentoría personalizada. Niveles A1–C1, preparación DELE/SIELE.',
      },
      hero: {
        badge: 'Aprende español con propósito',
        heading: ['Habla español con', 'confianza'] as [string, string],
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
        p1start:
          'Soy Maite Colodrón. Tras más de 12 años acompañando a estudiantes de todo el mundo, he aprendido que hablar un idioma no es conjugar verbos,',
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
        { title: 'Cápsulas A1/A2',  desc: 'Cimientos sólidos. Píldoras de vídeo y material descargable para avanzar a tu ritmo.',                    price: '19€/mes'  },
        { title: 'Cornelia B1+',    desc: 'Inmersión cultural. Domina el español intermedio a través de la literatura y la actualidad.',              price: '49€/mes'  },
        { title: 'Mentoría 1-a-1',  desc: 'Fluidez total. Sesiones personalizadas para resolver dudas y acelerar tus resultados.',                   price: '149€/mes' },
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
    },

    pricing: {
      header: {
        badge: 'Elige tu camino',
        heading: ['Planes y', 'precios'] as [string, string],
        subheading: 'Aprende español con',
        subheadingName: 'Maite Colodrón',
        subheadingEnd: 'al ritmo que necesitas',
      },
      period: '/mes',
      plans: [
        {
          label: 'Acceso inicial',
          title: 'Cápsulas A1/A2',
          subtitle: 'Membresía A1/A2',
          description: 'Cimientos sólidos. Píldoras de vídeo y material descargable para avanzar a tu ritmo.',
          features: [
            'Cápsulas de vídeo (5–10 min) semanales',
            'PDFs de vocabulario y gramática A1/A2',
            'Ejercicios de pronunciación',
            'Acceso a la comunidad privada',
            'Actualizaciones mensuales de contenido',
          ],
          cta: 'Empezar ahora',
        },
        {
          label: 'Más popular',
          title: 'Cornelia B1+',
          subtitle: 'Español intermedio',
          description: 'Inmersión cultural. Domina el español intermedio a través de la literatura y la actualidad.',
          features: [
            'Todo lo incluido en Cápsulas A1',
            'Curso completo basado en Cornelia',
            'Lecturas de actualidad con análisis',
            'Sesiones de conversación en grupo (2×/mes)',
            'Corrección de textos escritos',
            'Material de examen DELE/SIELE B1',
          ],
          cta: 'Quiero este plan',
        },
        {
          label: 'Experiencia premium',
          title: 'Mentoría 1-a-1',
          subtitle: 'Acompañamiento personalizado',
          description: 'Fluidez total. Sesiones personalizadas para resolver dudas y acelerar tus resultados.',
          features: [
            'Todo lo incluido en Cursos B1 Cornelia',
            'Sesiones 1-a-1 con Maite (4×/mes)',
            'Plan de estudio 100% personalizado',
            'Revisión detallada de tareas y escritura',
            'Soporte directo por WhatsApp',
            'Preparación intensiva para certificados oficiales',
          ],
          cta: 'Solicitar plaza',
        },
      ],
      guarantee: 'Todos los planes incluyen',
      guaranteeHighlight: '7 días de prueba gratuita',
      guaranteeEnd: '. Sin permanencia, cancela cuando quieras.',
      footer: {
        back: '← Volver al portal',
        credit: 'Desarrollado con',
        creditBy: 'por Marcos',
      },
    },

    controls: {
      toDark: 'Cambiar a modo oscuro',
      toLight: 'Cambiar a modo claro',
      langEs: 'Idioma actual: Español',
      langEn: 'Cambiar idioma a inglés',
    },
  },

  // ── ENGLISH ────────────────────────────────────────────────────────────────
  en: {
    home: {
      meta: {
        title: 'Learn Spanish with confidence',
        description:
          'Membership platform to learn Spanish online with Maite Colodrón. Videos, courses and personalized mentoring. Levels A1–C1, DELE/SIELE preparation.',
      },
      hero: {
        badge: 'Learn Spanish with purpose',
        heading: ['Speak Spanish with', 'confidence'] as [string, string],
        subheading: 'Classes and resources by',
        subheadingName: 'Maite Colodrón',
        subheadingEnd: 'adapted to your level and pace of life',
        ctaActive: 'Go to my materials',
        ctaStart: 'Get started',
        ctaAccount: 'My account',
        ctaLogin: 'I already have an account',
        ctaPlans: 'View plans',
      },
      about: {
        label: 'Your teacher',
        heading: 'Much more than grammar:',
        headingItalic: 'an immersion into real Spanish',
        p1start:
          "I'm Maite Colodrón. After more than 12 years accompanying students from around the world, I've learned that speaking a language is not about conjugating verbs,",
        p1italic: "it's about inhabiting a culture",
        p2: 'My method merges linguistic rigor with history and literature, eliminating stereotypes so you learn to think in Spanish. I want you to be not a tourist, but a speaker with',
        p2italic: 'confidence and purpose',
        photoAlt: 'Photo of Maite Colodrón, Spanish teacher',
        photoPlaceholder: "Maite's photo",
      },
      pills: [
        'A1 to C1 levels',
        'Video lessons',
        'Downloadable material',
        'Private community',
        'DELE/SIELE certifications',
        '1-on-1 mentoring',
      ],
      plans: [
        { title: 'A1/A2 Capsules',   desc: 'Solid foundations. Short video lessons and downloadable material to progress at your own pace.',     price: '€19/mo'  },
        { title: 'Cornelia B1+',     desc: 'Cultural immersion. Master intermediate Spanish through literature and current affairs.',             price: '€49/mo'  },
        { title: '1-on-1 Mentoring', desc: 'Total fluency. Personalized sessions to resolve doubts and accelerate your results.',                 price: '€149/mo' },
      ],
      cta: 'View all plans →',
      faq: {
        heading: 'Frequently asked questions',
        items: [
          { q: 'Do I need prior knowledge of Spanish?',                   a: 'No. The A1 Capsules are designed to start from scratch. If you already have a base, the B1 Courses or Mentoring adapt to your level.' },
          { q: 'Can I cancel my membership at any time?',                 a: 'Yes, with no commitment or penalties. Cancel from your account area and keep access until the end of the paid period.' },
          { q: "What's the difference between courses and mentoring?",    a: 'The courses are structured content you follow at your own pace. Mentoring adds 1-on-1 sessions with Maite, personalized feedback and a plan designed for your specific goals.' },
          { q: 'Are materials available after canceling?',                a: 'During your active membership you have full access. Upon canceling, access closes at the end of the billing cycle.' },
          { q: 'Can I prepare for the DELE with these courses?',          a: 'Yes. The content includes practice of the skills assessed by DELE (reading comprehension, oral and written expression). Mentoring allows a preparation plan specifically tailored to the exam.' },
        ],
      },
      footer: {
        copy: '© 2026',
        brand: 'Super Teacher',
        author: '· Maite Colodrón',
        navPlans: 'Plans',
        navLogin: 'Sign in',
        navWhatsApp: 'Contact via WhatsApp',
      },
    },

    pricing: {
      header: {
        badge: 'Choose your path',
        heading: ['Plans &', 'pricing'] as [string, string],
        subheading: 'Learn Spanish with',
        subheadingName: 'Maite Colodrón',
        subheadingEnd: 'at the pace you need',
      },
      period: '/mo',
      plans: [
        {
          label: 'Entry access',
          title: 'A1/A2 Capsules',
          subtitle: 'A1/A2 Membership',
          description: 'Solid foundations. Short video lessons and downloadable material to progress at your own pace.',
          features: [
            'Weekly video capsules (5–10 min)',
            'Vocabulary and grammar PDFs A1/A2',
            'Pronunciation exercises',
            'Access to private community',
            'Monthly content updates',
          ],
          cta: 'Get started',
        },
        {
          label: 'Most popular',
          title: 'Cornelia B1+',
          subtitle: 'Intermediate Spanish',
          description: 'Cultural immersion. Master intermediate Spanish through literature and current affairs.',
          features: [
            'Everything in A1 Capsules',
            'Full course based on Cornelia',
            'Current affairs readings with analysis',
            'Group conversation sessions (2×/month)',
            'Written text correction',
            'DELE/SIELE B1 exam material',
          ],
          cta: 'I want this plan',
        },
        {
          label: 'Premium experience',
          title: '1-on-1 Mentoring',
          subtitle: 'Personalized support',
          description: 'Total fluency. Personalized sessions to resolve doubts and accelerate your results.',
          features: [
            'Everything in Cornelia B1 Courses',
            '1-on-1 sessions with Maite (4×/month)',
            '100% personalized study plan',
            'Detailed task and writing review',
            'Direct WhatsApp support',
            'Intensive preparation for official certificates',
          ],
          cta: 'Request a spot',
        },
      ],
      guarantee: 'All plans include',
      guaranteeHighlight: '7-day free trial',
      guaranteeEnd: '. No commitment, cancel anytime.',
      footer: {
        back: '← Back to portal',
        credit: 'Built with',
        creditBy: 'by Marcos',
      },
    },

    controls: {
      toDark: 'Switch to dark mode',
      toLight: 'Switch to light mode',
      langEs: 'Switch language to Spanish',
      langEn: 'Current language: English',
    },
  },
} satisfies Record<Locale, unknown>
