-- ========================================================
-- BabySleep - Migração Inicial do Banco de Dados (Supabase/PostgreSQL)
-- FASE 1: Esquema Relacional, RLS e Índices de Alta Performance
-- ========================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para criar perfil automaticamente após cadastro no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, timezone)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Cuidador'), 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'timezone', 'America/Sao_Paulo')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABELA DE BEBÊS
CREATE TABLE IF NOT EXISTS public.babies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    habitual_wake_time TIME DEFAULT '07:00:00',
    habitual_bedtime TIME DEFAULT '19:30:00',
    expected_naps_count INTEGER DEFAULT 3,
    parenting_goal TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE CUIDADORES (Multi-cuidador)
CREATE TABLE IF NOT EXISTS public.caregivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'CAREGIVER', 'VIEWER')) DEFAULT 'CAREGIVER',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(baby_id, user_id)
);

-- 5. TABELA DE REGISTROS DE SONO (Sleep Records)
CREATE TABLE IF NOT EXISTS public.sleep_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('NAP', 'NIGHT_SLEEP')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    is_ongoing BOOLEAN DEFAULT FALSE,
    is_manually_added BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE DESPERTARES NOTURNOS (Awakenings)
CREATE TABLE IF NOT EXISTS public.sleep_awakenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sleep_record_id UUID NOT NULL REFERENCES public.sleep_records(id) ON DELETE CASCADE,
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    reason TEXT CHECK (reason IN ('HUNGER', 'DIAPER', 'DISCOMFORT', 'TEETHING', 'COLIC', 'UNKNOWN')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE PREVISÕES DE SONO E CALIBRAÇÃO (Previsão x Realidade)
CREATE TABLE IF NOT EXISTS public.sleep_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    calculated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    predicted_sleep_time TIMESTAMPTZ NOT NULL,
    window_start_time TIMESTAMPTZ NOT NULL,
    window_end_time TIMESTAMPTZ NOT NULL,
    estimated_duration_minutes INTEGER,
    confidence_level TEXT CHECK (confidence_level IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'MEDIUM',
    actual_sleep_time TIMESTAMPTZ,
    diff_minutes INTEGER,
    prediction_type TEXT DEFAULT 'NEXT_NAP',
    model_inputs JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABELA DO DIÁRIO DO BEBÊ (Baby Journal)
CREATE TABLE IF NOT EXISTS public.baby_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    mood TEXT CHECK (mood IN ('HAPPY', 'CALM', 'FUSSY', 'CRYING', 'TIRED', 'PLAYFUL')),
    content TEXT NOT NULL,
    tags TEXT[],
    associated_event_type TEXT,
    associated_event_id UUID,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABELA DE ALIMENTAÇÃO (Amamentação e Mamadeira)
CREATE TABLE IF NOT EXISTS public.feeding_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('BREAST', 'BOTTLE', 'SOLID')),
    breast_side TEXT CHECK (breast_side IN ('LEFT', 'RIGHT', 'BOTH')),
    breast_duration_minutes INTEGER,
    bottle_amount_ml NUMERIC(6, 2),
    bottle_contents TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABELA DE FRALDAS
CREATE TABLE IF NOT EXISTS public.diaper_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('WET', 'DIRTY', 'BOTH')),
    color TEXT,
    consistency TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TABELA DE OUTRAS ATIVIDADES
CREATE TABLE IF NOT EXISTS public.activity_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('BATH', 'MEDICINE', 'TEMPERATURE', 'WALK', 'TUMMY_TIME', 'NOTE')),
    value_numeric NUMERIC(5, 2),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. TABELA DE ASSINATURAS (Estrutura Preparada)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('FREE', 'PREMIUM_MONTHLY', 'PREMIUM_YEARLY')) DEFAULT 'FREE',
    status TEXT NOT NULL CHECK (status IN ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED')) DEFAULT 'FREE',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- ÍNDICES DE DESEMPENHO
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_babies_owner ON public.babies(owner_id);
CREATE INDEX IF NOT EXISTS idx_caregivers_baby_user ON public.caregivers(baby_id, user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_records_baby_start ON public.sleep_records(baby_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_awakenings_record ON public.sleep_awakenings(sleep_record_id);
CREATE INDEX IF NOT EXISTS idx_sleep_predictions_baby ON public.sleep_predictions(baby_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_baby_journal_baby_date ON public.baby_journal(baby_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_feeding_records_baby_ts ON public.feeding_records(baby_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_diaper_records_baby_ts ON public.diaper_records(baby_id, timestamp DESC);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_awakenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaper_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function rápida, não recursiva e segura com search_path estrito
CREATE OR REPLACE FUNCTION public.is_baby_caregiver(p_baby_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.babies b WHERE b.id = p_baby_id AND b.owner_id = auth.uid()
        UNION ALL
        SELECT 1 FROM public.caregivers c WHERE c.baby_id = p_baby_id AND c.user_id = auth.uid()
    );
$$;

-- 1. Profiles: Usuário gerencia apenas seu próprio perfil
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- 2. Babies: Usuário gerencia bebês dos quais é dono
CREATE POLICY "Owners can manage own babies" ON public.babies
    FOR ALL USING (owner_id = auth.uid());

-- Cuidadores autorizados podem visualizar bebês
CREATE POLICY "Caregivers can view authorized babies" ON public.babies
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.caregivers c WHERE c.baby_id = id AND c.user_id = auth.uid())
    );

-- 3. Caregivers: Apenas dono do bebê ou cuidador registrado pode ver vínculo
CREATE POLICY "Access caregivers for baby" ON public.caregivers
    FOR ALL USING (public.is_baby_caregiver(baby_id));

-- 4. Sleep Records: Dono e Cuidadores autorizados
CREATE POLICY "Manage sleep records" ON public.sleep_records
    FOR ALL USING (public.is_baby_caregiver(baby_id));

-- 5. Sleep Awakenings
CREATE POLICY "Manage sleep awakenings" ON public.sleep_awakenings
    FOR ALL USING (public.is_baby_caregiver(baby_id));

-- 6. Sleep Predictions
CREATE POLICY "Manage sleep predictions" ON public.sleep_predictions
    FOR ALL USING (public.is_baby_caregiver(baby_id));

-- 7. Baby Journal
CREATE POLICY "Manage baby journal" ON public.baby_journal
    FOR ALL USING (public.is_baby_caregiver(baby_id));

-- 8. Feeding Records
CREATE POLICY "Manage feeding records" ON public.feeding_records
    FOR ALL USING (public.is_baby_caregiver(baby_id));

-- 9. Diaper Records
CREATE POLICY "Manage diaper records" ON public.diaper_records
    FOR ALL USING (public.is_baby_caregiver(baby_id));

-- 10. Activity Records
CREATE POLICY "Manage activity records" ON public.activity_records
    FOR ALL USING (public.is_baby_caregiver(baby_id));

-- 11. Subscriptions: Apenas dono da assinatura
CREATE POLICY "Users can manage own subscription" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);
