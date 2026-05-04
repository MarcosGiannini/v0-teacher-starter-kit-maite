-- ═══════════════════════════════════════════════════════════════════════════
-- Super Teacher — Schema v2: Engagement Features
-- Fecha de diseño: 2026-05-04
-- Estado: DISEÑADO, pendiente de implementar en lógica de negocio
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: lessons
-- Catálogo maestro de lecciones (creado aquí como referencia para FK)
-- En producción se puede poblar desde el CMS o manualmente
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,          -- URL-friendly: 'a1-01-presentaciones'
  title       text NOT NULL,
  description text,
  plan_id     text NOT NULL,                 -- 'capsulas-a1' | 'cursos-b1-cornelia' | 'mentorship'
  order_index integer NOT NULL DEFAULT 0,    -- orden de aparición dentro del plan
  video_url   text,                          -- URL del vídeo (Vimeo, YouTube o CMS)
  duration_s  integer,                       -- duración en segundos
  is_preview  boolean NOT NULL DEFAULT false, -- true = visible sin suscripción
  created_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE lessons IS 'Catálogo de lecciones. Puede poblarse manualmente o desde un CMS (Contentful/Sanity).';

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: user_notes
-- Apuntes privados de cada alumno vinculados a una lección concreta
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id  uuid NOT NULL REFERENCES lessons(id)    ON DELETE CASCADE,
  content    text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Un alumno tiene como máximo un bloque de apuntes por lección
  CONSTRAINT user_notes_user_lesson_key UNIQUE (user_id, lesson_id)
);

COMMENT ON TABLE user_notes IS 'Apuntes privados por alumno y lección. Un registro por (user_id, lesson_id).';

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_notes_updated_at
  BEFORE UPDATE ON user_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: cada usuario solo accede a SUS apuntes
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notes: select own"
  ON user_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_notes: insert own"
  ON user_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_notes: update own"
  ON user_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_notes: delete own"
  ON user_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: community_posts
-- Foro/comunidad privada — posts visibles para todos los suscriptores activos
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id  uuid REFERENCES lessons(id) ON DELETE SET NULL, -- opcional: post ligado a una lección
  title      text,
  content    text NOT NULL,
  is_pinned  boolean NOT NULL DEFAULT false,  -- Maite puede fijar posts importantes
  is_hidden  boolean NOT NULL DEFAULT false,  -- moderación: ocultar sin borrar
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE community_posts IS 'Posts de la comunidad privada. Visibles para todos los alumnos con suscripción activa.';

CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: community_replies
-- Respuestas a posts (un nivel de profundidad, sin hilos infinitos)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_replies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text NOT NULL,
  is_hidden  boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE community_replies IS 'Respuestas a posts de comunidad. Un nivel de profundidad.';

-- RLS community_posts: leer si tiene suscripción activa, escribir solo el propio autor
-- Nota: la política de lectura referencia la tabla subscriptions que ya existe
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_posts: select if active subscriber"
  ON community_posts FOR SELECT
  USING (
    is_hidden = false
    AND EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.user_id = auth.uid()
        AND subscriptions.status  = 'active'
    )
  );

CREATE POLICY "community_posts: insert own"
  ON community_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.user_id = auth.uid()
        AND subscriptions.status  = 'active'
    )
  );

CREATE POLICY "community_posts: update own"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts: delete own"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_replies: select if active subscriber"
  ON community_replies FOR SELECT
  USING (
    is_hidden = false
    AND EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.user_id = auth.uid()
        AND subscriptions.status  = 'active'
    )
  );

CREATE POLICY "community_replies: insert own"
  ON community_replies FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.user_id = auth.uid()
        AND subscriptions.status  = 'active'
    )
  );

CREATE POLICY "community_replies: delete own"
  ON community_replies FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ÍNDICES de rendimiento
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS user_notes_user_id_idx       ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS user_notes_lesson_id_idx     ON user_notes(lesson_id);
CREATE INDEX IF NOT EXISTS community_posts_user_id_idx  ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS community_posts_lesson_id_idx ON community_posts(lesson_id);
CREATE INDEX IF NOT EXISTS community_replies_post_id_idx ON community_replies(post_id);
CREATE INDEX IF NOT EXISTS lessons_plan_id_idx          ON lessons(plan_id);
CREATE INDEX IF NOT EXISTS lessons_order_idx            ON lessons(plan_id, order_index);
