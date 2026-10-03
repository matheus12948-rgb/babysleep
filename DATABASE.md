# Documentação do Banco de Dados — BabySleep

O banco de dados do **BabySleep** utiliza o **PostgreSQL** hospedado no **Supabase**, com **Row Level Security (RLS)** em todas as tabelas e armazenamento de data/hora no padrão UTC (`TIMESTAMPTZ`).

---

## 1. Tabelas Estruturais

### `public.profiles`
Armazena informações cadastrais dos cuidadores e usuários do sistema.
- `id` (UUID, PK, FK `auth.users(id)` ON DELETE CASCADE)
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `timezone` (TEXT, default: `'America/Sao_Paulo'`)
- `is_admin` (BOOLEAN, default: `FALSE`)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `public.babies`
Perfis dos bebês acompanhados na plataforma. Suporta múltiplos bebês por cuidador.
- `id` (UUID, PK, default: `gen_random_uuid()`)
- `owner_id` (UUID, FK `public.profiles(id)` ON DELETE CASCADE)
- `name` (TEXT)
- `birth_date` (DATE)
- `gender` (TEXT: `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`)
- `habitual_wake_time` (TIME, default: `07:00:00`)
- `habitual_bedtime` (TIME, default: `19:30:00`)
- `expected_naps_count` (INTEGER, default: `3`)
- `parenting_goal` (TEXT)
- `avatar_url` (TEXT)

### `public.caregivers`
Mapeamento de multi-cuidador com níveis de permissão.
- `id` (UUID, PK)
- `baby_id` (UUID, FK `public.babies(id)`)
- `user_id` (UUID, FK `public.profiles(id)`)
- `role` (TEXT: `OWNER`, `CAREGIVER`, `VIEWER`)

### `public.sleep_records`
Registros históricos de sonecas e noites de sono.
- `id` (UUID, PK)
- `baby_id` (UUID, FK `public.babies(id)`)
- `type` (TEXT: `NAP`, `NIGHT_SLEEP`)
- `start_time` (TIMESTAMPTZ)
- `end_time` (TIMESTAMPTZ)
- `duration_minutes` (INTEGER)
- `quality_rating` (INTEGER: 1 a 5)
- `is_ongoing` (BOOLEAN, default: `FALSE`)
- `is_manually_added` (BOOLEAN, default: `FALSE`)
- `notes` (TEXT)

### `public.sleep_awakenings`
Despertares noturnos vinculados a uma noite de sono.
- `id` (UUID, PK)
- `sleep_record_id` (UUID, FK `public.sleep_records(id)`)
- `baby_id` (UUID, FK `public.babies(id)`)
- `start_time`, `end_time` (TIMESTAMPTZ)
- `duration_minutes` (INTEGER)
- `reason` (TEXT: `HUNGER`, `DIAPER`, `DISCOMFORT`, `TEETHING`, `COLIC`, `UNKNOWN`)

### `public.sleep_predictions` (Previsão vs. Realidade)
Histórico de estimativas geradas pelo motor para calibração de precisão.
- `id` (UUID, PK)
- `baby_id` (UUID, FK `public.babies(id)`)
- `calculated_at` (TIMESTAMPTZ)
- `predicted_sleep_time` (TIMESTAMPTZ)
- `window_start_time` (TIMESTAMPTZ)
- `window_end_time` (TIMESTAMPTZ)
- `estimated_duration_minutes` (INTEGER)
- `confidence_level` (TEXT: `LOW`, `MEDIUM`, `HIGH`)
- `actual_sleep_time` (TIMESTAMPTZ)
- `diff_minutes` (INTEGER: discrepância calculada entre a previsão e a realidade)
- `model_inputs` (JSONB)

### `public.feeding_records` (Alimentação Completa - FASE 3)
Registros de amamentação (com cronômetro por peito), mamadeiras e introdução alimentar.
- `id` (UUID, PK, default: `gen_random_uuid()`)
- `baby_id` (UUID, FK `public.babies(id)` ON DELETE CASCADE)
- `timestamp` (TIMESTAMPTZ, horário de início)
- `end_time` (TIMESTAMPTZ, horário de término)
- `type` (TEXT: `BREAST`, `BOTTLE`, `SOLID`)
- `breast_side` (TEXT: `LEFT`, `RIGHT`, `BOTH`)
- `breast_duration_minutes` (INTEGER, duração total da mamada)
- `left_duration_minutes` (INTEGER, duração no peito esquerdo)
- `right_duration_minutes` (INTEGER, duração no peito direito)
- `bottle_amount_ml` (NUMERIC(6, 2), presets ou personalizado)
- `bottle_contents` (TEXT: `BREAST_MILK`, `FORMULA`, `WATER`, `OTHER`)
- `solid_food_name` (TEXT, nome do alimento oferecido)
- `solid_food_amount` (TEXT, porção opcional)
- `solid_food_reaction` (TEXT: `LIKED`, `DISLIKED`, `NEUTRAL`, `MESSY`, `OTHER`)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

*Nota de Produto:* Não estima volume ingerido de leite a partir do tempo de amamentação. A aplicação armazena duração real.

### `public.diaper_records` (Fraldas - FASE 3)
Acompanhamento descritivo de trocas de fralda.
- `id` (UUID, PK, default: `gen_random_uuid()`)
- `baby_id` (UUID, FK `public.babies(id)` ON DELETE CASCADE)
- `timestamp` (TIMESTAMPTZ)
- `type` (TEXT: `WET`, `DIRTY`, `BOTH`)
- `consistency` (TEXT: `NORMAL`, `SOFT`, `LIQUID`, `HARD`)
- `color` (TEXT: `YELLOW`, `BROWN`, `GREEN`, `BLACK`, `RED`, `OTHER`)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

*Nota de Produto:* Apenas anotações descritivas. Não apresenta diagnósticos clínicos sobre cor ou consistência.

### `public.activity_records` (Cuidados e Atividades - FASE 3)
Registros de banhos, temperatura, medicamentos e brincadeiras/passeios.
- `id` (UUID, PK, default: `gen_random_uuid()`)
- `baby_id` (UUID, FK `public.babies(id)` ON DELETE CASCADE)
- `timestamp` (TIMESTAMPTZ)
- `category` (TEXT: `BATH`, `TEMPERATURE`, `MEDICINE`, `WALK`, `TUMMY_TIME`, `PLAY`, `NOTE`, `OTHER`)
- `value_numeric` (NUMERIC(5, 2), ex: 36.8 para temperatura)
- `unit` (TEXT: `'C'`, `'F'`, `'min'`)
- `measurement_method` (TEXT: `AXILLARY`, `RECTAL`, `EAR`, `FOREHEAD`)
- `medicine_name` (TEXT, informado exclusivamente pelo cuidador)
- `duration_minutes` (INTEGER)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

*Nota de Produto:* Medicamentos e temperatura são puramente descritivos sem sugestão de prescrição, dosagem médica automática ou diagnóstico.

### `public.baby_journal` (Diário do Bebê)
Memórias, humor e anotações diárias associadas aos eventos da rotina.
- `id` (UUID, PK)
- `baby_id` (UUID, FK `public.babies(id)`)
- `date` (DATE)
- `time` (TIME)
- `mood` (TEXT: `HAPPY`, `CALM`, `FUSSY`, `CRYING`, `TIRED`, `PLAYFUL`)
- `content` (TEXT)
- `tags` (TEXT[])
- `associated_event_type` (TEXT)

### `public.caregiver_invitations` (Convites de Cuidadores - FASE 5)
Convites com código alfanumérico curto para compartilhamento familiar.
- `id` (UUID, PK, default: `gen_random_uuid()`)
- `baby_id` (UUID, FK `public.babies(id)` ON DELETE CASCADE)
- `invited_by_user_id` (UUID, FK `public.profiles(id)` ON DELETE CASCADE)
- `email` (TEXT)
- `role` (TEXT: `CAREGIVER`, `VIEWER`)
- `invite_code` (TEXT UNIQUE, ex: `'BS-8X2K'`)
- `status` (TEXT: `PENDING`, `ACCEPTED`, `REJECTED`, `EXPIRED`)
- `expires_at` (TIMESTAMPTZ, validade padrão de 7 dias)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `public.user_subscriptions` (Assinaturas e Planos - FASE 5)
Controle de plano, status de assinatura e integração Stripe.
- `id` (UUID, PK, default: `gen_random_uuid()`)
- `user_id` (UUID, FK `public.profiles(id)` ON DELETE CASCADE UNIQUE)
- `plan_type` (TEXT: `FREE`, `PREMIUM_MONTHLY`, `PREMIUM_YEARLY`)
- `status` (TEXT: `ACTIVE`, `TRIALING`, `CANCELED`, `PAST_DUE`, `EXPIRED`)
- `stripe_customer_id` (TEXT)
- `stripe_subscription_id` (TEXT)
- `current_period_end` (TIMESTAMPTZ)
- `cancel_at_period_end` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMPTZ)

---

## 2. Políticas de Row Level Security (RLS)

A função de segurança `public.is_baby_caregiver(p_baby_id UUID)` centraliza a validação de autorização:
```sql
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
```
Toda leitura e gravação em registros de sono, diário, alimentação, fraldas e atividades é validada estritamente contra o vínculo de cuidador registrado, garantindo isolamento total entre usuários.
