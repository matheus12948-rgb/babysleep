-- ========================================================
-- BabySleep - Migração Incremental da FASE 8 (Painel Administrativo)
-- Esquema Seguro de Administração: Role, RLS, Auditoria e Configurações
-- ========================================================

-- 1. PAPEL DO USUÁRIO EM PROFILES (USER / ADMIN)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN'));

-- Atualiza perfis existentes que já eram is_admin = true
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE is_admin = TRUE AND (role IS NULL OR role = 'USER');

-- Função SECURITY DEFINER estável para verificar privilégio administrativo via RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'ADMIN' OR is_admin = TRUE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. TABELA DE AUDITORIA ADMINISTRATIVA (admin_audit_logs)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de alta performance para a auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.admin_audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- RLS de Auditoria: estritamente restrito a ADMIN
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- 3. TABELA DE CONFIGURAÇÕES GLOBAIS ADMINISTRATIVAS (admin_system_settings)
CREATE TABLE IF NOT EXISTS public.admin_system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS de Configurações
ALTER TABLE public.admin_system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view system settings" ON public.admin_system_settings;
CREATE POLICY "Admins can view system settings"
  ON public.admin_system_settings FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update system settings" ON public.admin_system_settings;
CREATE POLICY "Admins can update system settings"
  ON public.admin_system_settings FOR ALL
  USING (public.is_admin());

-- Insere configurações padrão do sistema
INSERT INTO public.admin_system_settings (key, value, description)
VALUES 
  ('app_info', '{"name": "BabySleep", "version": "1.8.0", "maintenance_mode": false}'::jsonb, 'Metadados gerais da aplicação'),
  ('prediction_engine', '{"weight_history": 0.4, "weight_last_nap": 0.35, "weight_night_sleep": 0.25, "tolerance_minutes": 15}'::jsonb, 'Parâmetros de referência e ponderação do algoritmo preditivo'),
  ('notification_defaults', '{"global_reminders": true, "default_lead_time": 15}'::jsonb, 'Parâmetros globais para envio de lembretes PWA'),
  ('subscription_sandbox', '{"sandbox_mode": true, "stripe_test_active": true}'::jsonb, 'Configuração da simulação sandbox de assinaturas')
ON CONFLICT (key) DO NOTHING;

-- 4. POLÍTICAS RLS ADMINISTRATIVAS PARA LEITURA DE TABELAS EXISTENTES

-- Profiles: Admins podem listar e gerenciar todos os perfis
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Babies: Admins podem visualizar listagem agregada
DROP POLICY IF EXISTS "Admins can view all babies" ON public.babies;
CREATE POLICY "Admins can view all babies"
  ON public.babies FOR SELECT
  USING (public.is_admin());

-- Subscriptions: Admins podem visualizar todas as assinaturas e gerenciar em sandbox
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can update all subscriptions"
  ON public.user_subscriptions FOR UPDATE
  USING (public.is_admin());

-- Sleep Records: Admins podem consultar registros para relatórios agregados
DROP POLICY IF EXISTS "Admins can view all sleep records" ON public.sleep_records;
CREATE POLICY "Admins can view all sleep records"
  ON public.sleep_records FOR SELECT
  USING (public.is_admin());

-- Caregivers: Admins podem consultar associações para contagem
DROP POLICY IF EXISTS "Admins can view all caregivers" ON public.caregivers;
CREATE POLICY "Admins can view all caregivers"
  ON public.caregivers FOR SELECT
  USING (public.is_admin());
