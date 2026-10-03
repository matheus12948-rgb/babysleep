-- ========================================================
-- BabySleep - Migração da FASE 5: Multi-Cuidador e Assinaturas
-- Convites de Cuidadores, Controle de Permissões e Planos
-- ========================================================

-- 1. TABELA DE CONVITES DE CUIDADORES
CREATE TABLE IF NOT EXISTS public.caregiver_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('CAREGIVER', 'VIEWER')) DEFAULT 'CAREGIVER',
    invite_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')) DEFAULT 'PENDING',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de convites
CREATE INDEX IF NOT EXISTS idx_invitations_baby ON public.caregiver_invitations(baby_id);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON public.caregiver_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.caregiver_invitations(email);

-- 2. TABELA DE ASSINATURAS E PLANOS (STRIPE ARCHITECTURE)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('FREE', 'PREMIUM_MONTHLY', 'PREMIUM_YEARLY')) DEFAULT 'FREE',
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'TRIALING', 'CANCELED', 'PAST_DUE', 'EXPIRED')) DEFAULT 'ACTIVE',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de assinaturas
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.user_subscriptions(status);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.caregiver_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para caregiver_invitations:
-- Apenas o dono (OWNER) do bebê pode criar ou revogar convites
CREATE POLICY "Owners can manage caregiver invitations" ON public.caregiver_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.babies b 
            WHERE b.id = caregiver_invitations.baby_id 
              AND b.owner_id = auth.uid()
        )
    );

-- Qualquer usuário autenticado pode ler convites pelo código para aceitá-los
CREATE POLICY "Authenticated users can verify invite code" ON public.caregiver_invitations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para user_subscriptions:
-- Usuários podem visualizar e gerenciar apenas suas próprias assinaturas
CREATE POLICY "Users can manage own subscription" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 4. ATUALIZAR FUNÇÃO DE VERIFICAÇÃO DE PERMISSÃO DE ESCRITA
-- Cuidadores com papel 'VIEWER' possuem acesso apenas de leitura (não podem inserir/editar)
CREATE OR REPLACE FUNCTION public.can_edit_baby(p_baby_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.babies b 
        WHERE b.id = p_baby_id AND b.owner_id = auth.uid()
        UNION ALL
        SELECT 1 FROM public.caregivers c 
        WHERE c.baby_id = p_baby_id 
          AND c.user_id = auth.uid() 
          AND c.role IN ('OWNER', 'CAREGIVER')
    );
$$;
