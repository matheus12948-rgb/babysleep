-- ========================================================
-- BabySleep - Migração Complementar da FASE 3
-- Rotina Completa: Amamentação L/R, Mamadeira, Fraldas e Atividades
-- ========================================================

-- 1. EXTENSÕES EM FEEDING_RECORDS
ALTER TABLE public.feeding_records
  ADD COLUMN IF NOT EXISTS left_duration_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS right_duration_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS solid_food_name TEXT,
  ADD COLUMN IF NOT EXISTS solid_food_reaction TEXT,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 2. EXTENSÕES EM DIAPER_RECORDS
ALTER TABLE public.diaper_records
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 3. EXTENSÕES EM ACTIVITY_RECORDS
ALTER TABLE public.activity_records
  ADD COLUMN IF NOT EXISTS unit TEXT, -- 'C', 'F', 'min', etc.
  ADD COLUMN IF NOT EXISTS measurement_method TEXT, -- 'AXILLARY', 'RECTAL', 'EAR', 'FOREHEAD'
  ADD COLUMN IF NOT EXISTS medicine_name TEXT,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

ALTER TABLE public.activity_records DROP CONSTRAINT IF EXISTS activity_records_category_check;
ALTER TABLE public.activity_records ADD CONSTRAINT activity_records_category_check 
  CHECK (category IN ('BATH', 'MEDICINE', 'TEMPERATURE', 'WALK', 'TUMMY_TIME', 'PLAY', 'NOTE', 'OTHER'));

-- 4. ÍNDICES ADICIONAIS PARA FILTROS DA TIMELINE
CREATE INDEX IF NOT EXISTS idx_feeding_records_baby_date ON public.feeding_records(baby_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_diaper_records_baby_date ON public.diaper_records(baby_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_records_baby_date ON public.activity_records(baby_id, timestamp DESC);
