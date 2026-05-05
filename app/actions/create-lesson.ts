'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type CreateLessonState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

/** Valores válidos para plan_id — sincronizados con las price IDs de Stripe */
const VALID_PLAN_IDS = ['capsulas-a1', 'cursos-b1-cornelia', 'mentorship'] as const
type PlanId = typeof VALID_PLAN_IDS[number]

// ─────────────────────────────────────────────────────────────────────────────
// Validación ligera de slug
// ─────────────────────────────────────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateSlug(value: string): string | null {
  if (!value) return 'El slug es obligatorio.'
  if (value.length > 120) return 'El slug no puede superar 120 caracteres.'
  if (!SLUG_RE.test(value)) return 'Solo minúsculas, números y guiones. Sin espacios ni caracteres especiales.'
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Server Action principal
// ─────────────────────────────────────────────────────────────────────────────
export async function createLesson(
  _prevState: CreateLessonState,
  formData: FormData,
): Promise<CreateLessonState> {
  // ── 1. Autenticación + autorización ───────────────────────────────────────
  const supabase = await createClient()
  if (!supabase) return { success: false, error: 'No se pudo conectar con la base de datos.' }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  if (user.app_metadata?.role !== 'admin') {
    redirect('/dashboard')
  }

  // ── 2. Extracción de campos ────────────────────────────────────────────────
  const title       = (formData.get('title')       as string | null)?.trim() ?? ''
  const slug        = (formData.get('slug')         as string | null)?.trim().toLowerCase() ?? ''
  const planId      = (formData.get('plan_id')      as string | null)?.trim() ?? ''
  const videoUrl    = (formData.get('video_url')    as string | null)?.trim() ?? ''
  const description = (formData.get('description')  as string | null)?.trim() ?? ''
  const orderRaw    = (formData.get('order_index')  as string | null)?.trim() ?? '1'
  const durationRaw = (formData.get('duration_s')   as string | null)?.trim() ?? ''
  const isPreview   = formData.get('is_preview') === 'on'

  // ── 3. Validación ──────────────────────────────────────────────────────────
  const fieldErrors: Record<string, string> = {}

  if (!title) fieldErrors.title = 'El título es obligatorio.'
  if (title.length > 200) fieldErrors.title = 'El título no puede superar 200 caracteres.'

  const slugError = validateSlug(slug)
  if (slugError) fieldErrors.slug = slugError

  if (!VALID_PLAN_IDS.includes(planId as PlanId)) {
    fieldErrors.plan_id = 'Selecciona un nivel válido.'
  }

  if (videoUrl && !/^https?:\/\/.+/.test(videoUrl)) {
    fieldErrors.video_url = 'Introduce una URL válida (https://…).'
  }

  const orderIndex = parseInt(orderRaw, 10)
  if (isNaN(orderIndex) || orderIndex < 1) {
    fieldErrors.order_index = 'El orden debe ser un número positivo.'
  }

  const durationS = durationRaw ? parseInt(durationRaw, 10) : null
  if (durationRaw && (isNaN(durationS!) || durationS! < 0)) {
    fieldErrors.duration_s = 'La duración debe ser un número positivo (en segundos).'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  // ── 4. INSERT en Supabase ──────────────────────────────────────────────────
  const { error: dbError } = await supabase
    .from('lessons')
    .insert({
      title,
      slug,
      plan_id:     planId,
      description: description || null,
      video_url:   videoUrl   || null,
      order_index: orderIndex,
      duration_s:  durationS,
      is_preview:  isPreview,
    })

  if (dbError) {
    // slug duplicado → código 23505 (unique violation)
    if (dbError.code === '23505') {
      return { success: false, fieldErrors: { slug: 'Este slug ya existe. Elige uno diferente.' } }
    }
    // Tabla no existe → schema_v2.sql no se ha ejecutado todavía en Supabase
    if (dbError.code === '42P01') {
      console.error('[createLesson] La tabla "lessons" no existe. Ejecuta supabase/schema_v2.sql en el SQL Editor de Supabase.')
      return { success: false, error: 'La base de datos no está preparada. El administrador técnico debe ejecutar schema_v2.sql en Supabase.' }
    }
    console.error('[createLesson] DB error:', dbError.code, dbError.message)
    return { success: false, error: 'Error al guardar la lección. Inténtalo de nuevo.' }
  }

  // ── 5. Invalidar cache y redirigir ─────────────────────────────────────────
  revalidatePath('/dashboard')
  return { success: true }
}
