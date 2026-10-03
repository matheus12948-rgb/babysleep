-- ========================================================
-- BabySleep - Migração da FASE 4: Educação e Conteúdos
-- Progresso de Cursos, Aulas Concluídas e Favoritos
-- ========================================================

-- 1. TABELA DE PROGRESSO EDUCACIONAL
CREATE TABLE IF NOT EXISTS public.user_education_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('LESSON', 'ARTICLE')),
    content_id TEXT NOT NULL,
    course_id TEXT,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    is_bookmarked BOOLEAN DEFAULT FALSE NOT NULL,
    last_read_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_content UNIQUE (user_id, content_type, content_id)
);

-- 2. ÍNDICES DE DESEMPENHO
CREATE INDEX IF NOT EXISTS idx_user_education_user ON public.user_education_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_education_content ON public.user_education_progress(content_type, content_id);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_education_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own education progress" ON public.user_education_progress
    FOR ALL USING (auth.uid() = user_id);
