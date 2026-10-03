# BabySleep 🌙👶

Uma aplicação Web/PWA moderna, acolhedora e inteligente de acompanhamento de sono, janelas de vigília e rotina completa do bebê (alimentação, fraldas, banho, cuidados e atividades), com design autoral, código modular e foco total na experiência mobile dos pais e cuidadores.

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 19 + TypeScript + Vite
- **Estilização:** Tailwind CSS v4 + Plus Jakarta Sans
- **Gráficos & Estatísticas:** Recharts
- **Ícones:** Lucide React
- **Backend & Auth:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Segurança:** Row Level Security (RLS) com isolamento estrito por bebê e cuidador
- **Datas & Timezone:** `date-fns` com locale em Português (pt-BR)

---

## 🚀 Como Executar Localmente

### 1. Clonar ou Acessar o Repositório
```bash
cd "Clone Napper"
```

### 2. Instalar as Dependências
No Windows PowerShell:
```powershell
npm.cmd install
```

### 3. Configurar as Variáveis de Ambiente
Copie o arquivo de exemplo:
```powershell
cp .env.example .env
```
Para conectar a um projeto real do Supabase, preencha:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```
*(Nota: O aplicativo conta com fallback resiliente para desenvolvimento local, funcionando perfeitamente mesmo sem credenciais preenchidas).*

### 4. Executar o Servidor de Desenvolvimento
```powershell
npm.cmd run dev
```

### 5. Compilar para Produção (Build)
```powershell
npm.cmd run build
```

### 6. Executar os Testes Automatizados
```powershell
# Executar todos os testes (Fases 1, 2, 3 e 3.5):
npm.cmd run validate:all

# Ou executar individualmente:
npx.cmd tsx tests/validate_phase1.ts
npx.cmd tsx tests/validate_phase2.ts
npx.cmd tsx tests/validate_phase3.ts
npx.cmd tsx tests/validate_phase35.ts
```

---

## 📂 Migrações do Banco de Dados (Supabase)

Os scripts SQL com todas as tabelas, índices e políticas RLS estão em `supabase/migrations/`:
1. [`20261003_initial_schema.sql`](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/supabase/migrations/20261003_initial_schema.sql) — Esquema inicial (Fase 1)
2. [`20261003_phase2_extensions.sql`](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/supabase/migrations/20261003_phase2_extensions.sql) — Extensões analíticas (Fase 2)
3. [`20261003_phase3_routine.sql`](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/supabase/migrations/20261003_phase3_routine.sql) — Extensões da rotina diária (Fase 3)

---

## 📖 Documentações do Projeto

- 📐 [**ARCHITECTURE.md**](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/ARCHITECTURE.md): Arquitetura de software, hooks especializados e princípios de design.
- 🗄️ [**DATABASE.md**](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/DATABASE.md): Esquema detalhado de dados, tabelas de rotina e RLS.
- ⏱️ [**SLEEP_ALGORITHM.md**](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/SLEEP_ALGORITHM.md): Parâmetros de referência de sono e motor de previsão vs. realidade.
- 🗺️ [**ROADMAP.md**](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/ROADMAP.md): Planejamento e status detalhado das 7 fases.

---

## ⚖️ Aviso de Responsabilidade Pediátrica

O BabySleep fornece estimativas de janelas de sono, registros de rotina e informações gerais baseadas em parâmetros de referência e hábitos informados pelo cuidador. Não substitui consulta, prescrição médica, orientação profissional ou diagnóstico pediátrico.
