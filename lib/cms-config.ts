/**
 * cms-config.ts — Configuración del CMS de contenidos
 *
 * ESTADO ACTUAL (Fase 5):
 *   Las lecciones están como datos estáticos en el código.
 *   Este archivo define la arquitectura para migrar a un CMS headless
 *   cuando el catálogo crezca y Maite necesite gestionar el contenido
 *   de forma autónoma (sin tocar código).
 *
 * OPCIONES EVALUADAS:
 *
 *   A) Contentful
 *      - Pros: UI muy intuitiva, buen soporte de rich text, SDK maduro
 *      - Contras: precio al escalar, vendor lock-in
 *      - Paquete: `npm install contentful`
 *      - Variables necesarias:
 *          CONTENTFUL_SPACE_ID=...
 *          CONTENTFUL_ACCESS_TOKEN=...
 *          CONTENTFUL_PREVIEW_TOKEN=...
 *
 *   B) Sanity.io ← RECOMENDADO
 *      - Pros: Studio personalizable, GROQ query language potente,
 *              hosting gratuito del estudio, excelente DX con Next.js
 *      - Contras: curva de aprendizaje de GROQ
 *      - Paquete: `npm install next-sanity`
 *      - Variables necesarias:
 *          NEXT_PUBLIC_SANITY_PROJECT_ID=...
 *          NEXT_PUBLIC_SANITY_DATASET=production
 *          SANITY_API_TOKEN=...   (solo servidor)
 *
 *   C) Storyblok
 *      - Pros: visual editor en tiempo real, buen soporte de componentes
 *      - Contras: precio alto en planes avanzados
 *
 * CÓMO ACTIVAR (ejemplo con Sanity):
 *
 *   1. `npm install next-sanity`
 *   2. Cambiar CMS_PROVIDER a 'sanity'
 *   3. Descomentar el bloque sanity.config abajo
 *   4. Crear `sanity.config.ts` en la raíz con el schema de lecciones
 *   5. El tipo `CmsLesson` ya está definido — el adaptador solo necesita
 *      mapear los campos del CMS a ese tipo
 */

// ─────────────────────────────────────────────────────────────────────────────
// Proveedor activo
// ─────────────────────────────────────────────────────────────────────────────
export const CMS_PROVIDER: 'none' | 'contentful' | 'sanity' | 'storyblok' = 'none'

// ─────────────────────────────────────────────────────────────────────────────
// Tipo canónico de Lección — independiente del CMS elegido
// Todos los adaptadores deben devolver este tipo
// ─────────────────────────────────────────────────────────────────────────────
export interface CmsLesson {
  /** UUID o slug estable — se almacena en user_notes.lesson_id */
  id: string
  slug: string
  title: string
  description: string
  /** 'capsulas-a1' | 'cursos-b1-cornelia' | 'mentorship' */
  planId: string
  /** Orden dentro del plan (1-based) */
  orderIndex: number
  /** URL del vídeo (Vimeo, YouTube, CDN propio…) */
  videoUrl: string | null
  /** Duración en segundos */
  durationSeconds: number | null
  /** true = accesible sin suscripción (preview gratuito) */
  isPreview: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Adaptador: sin CMS (datos estáticos en código)
// Reemplazar por el adaptador del CMS elegido cuando se active
// ─────────────────────────────────────────────────────────────────────────────
export async function getLessonBySlug(slug: string): Promise<CmsLesson | null> {
  if (CMS_PROVIDER === 'none') {
    return STATIC_LESSONS.find((l) => l.slug === slug) ?? null
  }

  // TODO: implementar el adaptador del CMS elegido
  // if (CMS_PROVIDER === 'sanity') return getSanityLessonBySlug(slug)
  // if (CMS_PROVIDER === 'contentful') return getContentfulLessonBySlug(slug)

  return null
}

export async function getLessonsByPlan(planId: string): Promise<CmsLesson[]> {
  if (CMS_PROVIDER === 'none') {
    return STATIC_LESSONS
      .filter((l) => l.planId === planId)
      .sort((a, b) => a.orderIndex - b.orderIndex)
  }

  // TODO: implementar el adaptador del CMS elegido
  return []
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos estáticos de muestra (sustituir por CMS en Fase 6)
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_LESSONS: CmsLesson[] = [
  {
    id:              'a1-01-presentaciones',
    slug:            'a1-01-presentaciones',
    title:           'Lección 1 — Presentaciones en español',
    description:     'Aprende a presentarte con confianza: nombre, origen, profesión y gustos personales.',
    planId:          'capsulas-a1',
    orderIndex:      1,
    videoUrl:        null,
    durationSeconds: 480,
    isPreview:       true,
  },
  {
    id:              'a1-02-numeros-y-fechas',
    slug:            'a1-02-numeros-y-fechas',
    title:           'Lección 2 — Números y fechas',
    description:     'Domina los números del 0 al 1000 y aprende a expresar fechas y horas.',
    planId:          'capsulas-a1',
    orderIndex:      2,
    videoUrl:        null,
    durationSeconds: 540,
    isPreview:       false,
  },
  {
    id:              'b1-01-cornelia-intro',
    slug:            'b1-01-cornelia-intro',
    title:           'Cornelia — Introducción al método',
    description:     'Presentación del enfoque cultural de Cornelia y primeras lecturas del texto.',
    planId:          'cursos-b1-cornelia',
    orderIndex:      1,
    videoUrl:        null,
    durationSeconds: 720,
    isPreview:       false,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Configuración de Sanity (descomentar cuando se active)
// ─────────────────────────────────────────────────────────────────────────────
// export const sanityConfig = {
//   projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
//   dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
//   apiVersion: '2026-05-04',
//   useCdn:    process.env.NODE_ENV === 'production',
// }

// ─────────────────────────────────────────────────────────────────────────────
// Configuración de Contentful (descomentar cuando se active)
// ─────────────────────────────────────────────────────────────────────────────
// export const contentfulConfig = {
//   spaceId:     process.env.CONTENTFUL_SPACE_ID!,
//   accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
//   previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
// }
