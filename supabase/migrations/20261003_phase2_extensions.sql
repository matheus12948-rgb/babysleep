-- ========================================================
-- BabySleep - Migração Complementar da FASE 2
-- Extensões para Estimativas Avançadas e Notificações
-- ========================================================

-- Adiciona campos de pontuação de confiança e justificativa na tabela de previsões
ALTER TABLE public.sleep_predictions 
  ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS reasoning TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS consistency_status TEXT DEFAULT 'INSUFFICIENT';

-- Tabela de configurações de notificações do usuário
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    nap_reminders_enabled BOOLEAN DEFAULT TRUE,
    bedtime_reminders_enabled BOOLEAN DEFAULT TRUE,
    routine_reminders_enabled BOOLEAN DEFAULT TRUE,
    lead_time_minutes INTEGER DEFAULT 15,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '06:30:00',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, baby_id)
);

-- RLS para notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification settings" ON public.notification_settings
    FOR ALL USING (auth.uid() = user_id);
