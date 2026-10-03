# Arquitetura do Sistema — BabySleep

O **BabySleep** é uma aplicação Web responsiva e Progressive Web App (PWA) de acompanhamento do sono e rotina de bebês, construída com arquitetura modular, escalável e desacoplada.

---

## 1. Princípios de Arquitetura

1. **Separação Estrita de Responsabilidades:**
   - **UI / Apresentação (`/src/pages`, `/src/components`):** Responsáveis exclusivamente pela exibição e interação visual com o cuidador.
   - **Hooks Especializados (`/src/hooks`):** Hooks reativos com escopo definido (`useFeeding`, `useDiapers`, `useActivities`, `useRoutineTimeline`, `useTheme`). Nenhuma lógica complexa de negócios é embutida diretamente nos componentes de renderização.
   - **Lógica de Domínio (`/src/features`):** Regras de negócio divididas por verticais de domínio (sono, estatísticas, motor preditivo de sono).
   - **Camada de Dados (`/src/services`):** `DataService` centraliza o CRUD tipado, integrando PostgreSQL/Supabase com fallback e sincronização local sem duplicidade de IDs.
   - **Tipos TypeScript Estritos (`/src/types`):** Tipagem forte e expressiva (`FeedingRecord`, `DiaperRecord`, `ActivityRecord`, `UnifiedTimelineEvent`, etc.) sem uso de `any`.

2. **Mobile First & Velocidade Operacional:**
   - Pais com o bebê no colo conseguem registrar qualquer evento com 1 toque no botão `+` e 2 a 3 toques para concluir.
   - Menus ergonomicamente organizados na *thumb zone* com modais e bottom sheets.
   - Cronômetro de amamentação com botões táteis ampliados para peito esquerdo e direito, pausa e troca instantânea de lado.

3. **Resiliência e Tolerância a Falhas (Offline First):**
   - Na ausência de conexão à internet ou indisponibilidade temporária do backend, os registros são armazenados no `localStorage` sob IDs temporários (`feeding-temp-...`, `diaper-temp-...`, `act-temp-...`).
   - Ao reconectar, a camada de serviço realiza merge deduplicado garantindo que nenhum evento seja perdido ou duplicado.

4. **Isolamento de Segurança (Multi-inquilino / Multi-cuidador):**
   - Políticas PostgreSQL Row Level Security (RLS) impedem que cuidadores de um bebê tenham visibilidade ou permissão de modificação sobre dados de outro bebê.

---

## 2. Estrutura de Diretórios Expandida (Fases 1, 2, 3 e 3.5)

```text
src/
├── components/
│   ├── routine/        # Modais de rotina: BreastfeedingModal, BottleModal, SolidFoodModal,
│   │                   # DiaperModal, CareActivityModal, ConfirmDeleteModal
│   └── ui/             # Componentes genéricos de UI (QuickLogModal, PageLoader, etc.)
├── features/
│   ├── admin/          # Painel Administrativo (/admin), Layout, Rotas e Páginas (Fase 8)
│   ├── auth/           # Autenticação, sessão e proteção
│   ├── baby/           # Perfis de bebês e cálculo de idade
│   ├── caregiver/      # Multi-cuidador, permissões OWNER/CAREGIVER/VIEWER e convites
│   ├── education/      # Cursos, aulas, artigos e progresso educacional
│   ├── journal/        # Diário do bebê, humor e memórias da família
│   ├── notifications/  # Lembretes de sono e algoritmo de Horário Silencioso
│   ├── sleep-engine/   # Motor de previsão de janelas de sono e calibração
│   ├── sleep-tracker/  # Timer de sono em tempo real e registros retroativos
│   ├── sounds/         # Motor procedural de áudio Web Audio API e MediaSession
│   ├── statistics/     # Agregações, médias móveis, tendências e gráficos Recharts
│   └── subscription/   # Modelos Free/Premium, Paywall e checkout sandbox
├── hooks/              # Custom hooks: useFeeding, useDiapers, useActivities, useTheme, etc.
├── layouts/            # AppLayout com Header, Bottom Nav e Ação Rápida (+)
├── pages/              # Telas da aplicação do usuário (Dashboard, Timeline, Stats, Sounds, Profile)
├── pwa/                # PWAService, registro de Service Worker e ciclo de vida
├── services/           # DataService, AdminDataService, SupabaseClient (CRUD completo)
├── types/              # Definições globais TypeScript (rotina, sono, perfis, admin)
└── utils/              # Segurança contra XSS, formatação de amamentação e conversões
```

---

## 3. Diretrizes de Comunicação e Não-Causalidade

- **Terminologia do Motor de Sono:** "Parâmetros de referência de sono", "Janela sugerida", "Previsão", "Confiança".
- **Comunicação de Rotina:** O registro de amamentação armazena a duração real e não estima volume em ml.
- **Isenção de Diagnósticos:** O registro de fraldas, temperatura e medicamentos é meramente descritivo, acompanhado do disclaimer mandatório de responsabilidade em saúde, sem prescrição ou cálculo automático de dosagens.
- **Correlações Descritivas:** Análises cruzadas expressam observações de padrões (ex.: *"Nos últimos 14 dias, 5 sonecas ocorreram dentro de 60 minutos após uma mamadeira"*) sem jamais alegar causalidade (*"A mamadeira fez o bebê dormir melhor"*).

---

## 4. Estratégia de Performance e Code Splitting (Fase 3.5 e 8)

Para garantir que o carregamento inicial em redes móveis seja instantâneo, a aplicação adota uma estratégia de particionamento dinâmico de código:

1. **Core Crítico Síncrono (Primeiro Paint):**
   - Carregado imediatamente: Layout básico, Autenticação, Provedor do Bebê Ativo, Provedor do Rastreador de Sono, e `DashboardPage`.
   - Permite que o cuidador abra a aplicação e registre sono ou visualize o status do bebê em fração de segundo.

2. **Carregamento Sob Demanda (`React.lazy` + `Suspense`):**
   - `StatsPage`: Carregado apenas quando o usuário clica na aba de Estatísticas.
   - `SoundsPage`: Carregado apenas na aba de Sons.
   - `TimelinePage`: Carregado apenas na aba de Linha do Tempo.
   - `ProfilePage`: Carregado apenas na aba de Perfil/Configurações.
   - `AdminView`: Carregado sob demanda estritamente quando a rota `/admin*` é solicitada.
   - `OnboardingView`: Carregado apenas se o usuário não possuir bebês cadastrados ou estiver adicionando um novo bebê.
   - Fallback gracioso com `PageLoader` apresentando indicador minimalista e temático sem saltos de layout.

3. **Isolamento de Bibliotecas Pesadas (`manualChunks` no Vite/Rollup):**
   - `vendor-recharts`: Todo o ecossistema do Recharts e suas dependências matemáticas isolados em chunk próprio (`vendor-recharts-[hash].js`), não consumindo banda no carregamento inicial.
   - `vendor-supabase`: Biblioteca do cliente Supabase isolada para cache HTTP eficiente.
   - `AdminView`: Painel administrativo completo isolado em chunk próprio (`dist/assets/AdminView-[hash].js`, ~94 KB).
   - **Resultado:** Redução do JavaScript de entrada de **877.28 KB** para **403.42 KB (113.37 KB gzip)**, mantendo performance de alta velocidade.

---

## 5. Arquitetura de Áudio Procedural e Conteúdos Educativos (Fase 4)

### 5.1 Motor de Áudio Web Audio API (`SoundEngine.ts`)
- **Síntese 100% Procedural e Offline:** Todo o espectro acústico (ruído branco, rosa, marrom, sons de ondas do mar, chuva, batimentos cardíacos, shush uterino e melodias suaves) é sintetizado em tempo real utilizando nós nativos da Web Audio API (`AudioBufferSourceNode`, `BiquadFilterNode`, `GainNode`, `OscillatorNode`).
- **Zero Assets Externos:** Elimina a necessidade de downloads de dezenas de megabytes de arquivos `.mp3`/`.wav`, garantindo carregamento instantâneo e funcionamento mesmo em modo avião ou sem conexão.
- **Fade-Out Gradual Programável:** Utiliza rampas exponenciais e lineares no nó mestre de ganho nos últimos 1 a 5 minutos configurados, reduzindo suavemente o volume para zero e evitando despertares de susto em bebês no sono leve.
- **Mini Player Persistente (`MiniSoundPlayer.tsx`):** O `SoundProvider` global gerencia o estado da reprodução e o timer contínuo no topo da aplicação, permitindo que cuidadores naveguem entre abas sem interrupção do som.

### 5.2 Módulo Educacional Estruturado (`src/features/education/`)
- **Separação Semântica:** Cursos estruturados com aulas progressivas por marcos etários (0-3 meses, 4 meses, 6-12 meses, alimentação & sono) e biblioteca temática de artigos com busca textual e tags.
- **Persistência de Progresso:** Tabela Supabase `user_education_progress` com RLS por cuidador e cache sincronizado em `localStorage` para leitura e marcação offline.
- **Diretriz Ética de Não Diagnóstico:** Todos os conteúdos e artigos contêm nota de rodapé explícita: *"Parâmetros de referência e orientações educativas gerais. Não substituem o acompanhamento e a conduta do médico pediatra."*

---

## 6. Arquitetura Multi-Cuidador, Tempo Real e Assinaturas (Fase 5)

### 6.1 Matriz de Papéis e Permissões Granulares (`src/types/caregiver.ts`)
- **`OWNER`:** Responsável principal / criador do perfil do bebê. Possui permissão plena de gravação, exclusão, convite de novos cuidadores, alteração de planos e geração de relatórios.
- **`CAREGIVER`:** Co-mãe, co-pai, babá ou cuidador diário. Possui permissão completa de registro e edição de sono, alimentação, fraldas, atividades e diário, mas não pode convidar terceiros nem excluir o bebê.
- **`VIEWER`:** Avós, tios, observadores externos e pediatra. Possui permissão estritamente de leitura.

### 6.2 Ciclo de Vida de Convites (`caregiver_invitations`)
- Códigos alfanuméricos curtos e legíveis (`BS-XXXX`) com expiração automática em 7 dias.
- Proteção contra reutilização (`status: 'ACCEPTED'`), verificação de validade temporal e revogação imediata pelo `OWNER`.

### 6.3 Sincronização em Tempo Real (`useBabyRealtime.ts`)
- Escuta ativa em canais Supabase Realtime (`postgres_changes`) filtrados por `baby_id` para tabelas de sono, alimentação, fraldas, atividades e cuidadores.

### 6.4 Modelo de Assinaturas & Paywall (`SubscriptionContext.tsx`)
- Modelo híbrido `FREE` vs `PREMIUM` gerenciado no Supabase com fallback persistente no `localStorage`.
- Modal Paywall com checkout simulado/sandbox de 7 dias grátis.

### 6.5 Relatório Consolidado para o Pediatra (`PediatricReportModal.tsx`)
- Consolidação clínica descritiva dos últimos 7, 14 ou 30 dias com médias diárias de sono, sonecas, mamadas, volume de mamadeiras, fraldas de xixi/cocô e notas de intercorrências.

---

## 7. Arquitetura PWA Avançada, Notificações & MediaSession (Fase 6)

### 7.1 Web App Manifest & Instalação Standalone (`public/manifest.webmanifest`)
- `display: standalone`, `orientation: portrait-primary`, cores temáticas (`theme_color: #1e1b4b`, `background_color: #0f172a`), ícones de 192px e 512px com propósito `maskable any`.
- Atalhos Rápidos de Aplicativo (Shortcuts) para "Registrar Sono" e "Amamentação".

### 7.2 Service Worker & Cache Offline Resiliente (`public/sw.js`)
- Precache do App Shell (`babysleep-cache-v1`), estratégias Stale-While-Revalidate para assets e Network-First para navegação HTML, limpeza automática em `activate`.

### 7.3 Motor de Notificações & Horário Silencioso (`NotificationService.ts`)
- Antecedência configurável (5, 10, 15, 30 min) com tratamento algorítmico robusto de Horário Silencioso (`isInQuietHours`) que trata cruzamentos de meia-noite.

### 7.4 Áudio em Segundo Plano & MediaSession API (`SoundEngine.ts`)
- Mapeamento nativo com o sistema operacional para reprodução contínua na tela de bloqueio e fones Bluetooth.

---

## 8. Acessibilidade WCAG 2.1 AA, Segurança & Resiliência (Fase 7)

### 8.1 Acessibilidade Digital (WCAG 2.1 AA)
- Landmarks HTML5, suporte a leitores de tela (`aria-label`, `aria-current`, `aria-haspopup`, `aria-modal`), navegação total por teclado com anéis de foco visíveis e `NetworkStatusIndicator.tsx` com `role="status"` e `aria-live="polite"`.

### 8.2 Segurança da Aplicação e Prevenção de XSS (`src/utils/security.ts`)
- Sanitização rigorosa (`sanitizeInput`), escape de entidades (`escapeHtml`) e limpeza de sessão sem vazamento de cache (`secureSignOutCleanup`).

### 8.3 Resiliência e Tolerância a Falhas (`ErrorBoundary.tsx`)
- Barreira global de erros com interface temática e amigável para contingência sem perda de dados.

---

## 9. Painel Administrativo (/admin), Segurança & Auditoria (Fase 8)

### 9.1 Isolamento e Roteamento Administrativo
- **Code Splitting Sob Demanda:** O módulo administrativo (`src/features/admin/AdminView.tsx`) é carregado via `React.lazy`, gerando o chunk `dist/assets/AdminView-[hash].js` (~94 KB). Usuários regulares da aplicação principal nunca realizam download deste código.
- **Deep Linking Nativo:** O container `AdminView` mapeia o histórico nativo (`popstate` e `pushState`) sincronizando as 9 rotas requeridas:
  - `/admin`: Dashboard executivo com KPIs reais do banco.
  - `/admin/users` e `/admin/users/:id`: Gestão paginada de usuários, detalhes de bebês e métricas de engajamento.
  - `/admin/babies`: Listagem de bebês sob o princípio de mínimo acesso e contagem de cuidadores.
  - `/admin/subscriptions`: Monitoramento de planos e trials com rotulagem inequívoca de "Sandbox / Simulação".
  - `/admin/content`: Moderação de cursos, módulos, aulas e artigos com publicação/despublicação.
  - `/admin/sounds`: Catálogo dos 12 sons procedurais permitindo desativação/ativação dinâmica.
  - `/admin/reports`: Relatórios com Recharts em períodos de 7, 14, 30 e 90 dias.
  - `/admin/audit`: Trilha de auditoria administrativa consultável com filtros por ação.
  - `/admin/settings`: Parâmetros de aplicativo, pesos do algoritmo preditivo e flags de sandbox.

### 9.2 Guarda de Rota Server-Side (`AdminRoute.tsx`)
- **Validação Segura no Supabase:** A função `AdminDataService.checkIsAdmin` consulta `profiles.role` (`ADMIN`) e `profiles.is_admin` diretamente no PostgreSQL com RLS ativo.
- **Não Confiabilidade de Parâmetros Locais:** Não se baseia em URLs, localStorage forjado ou estados React manipuláveis.
- **Políticas de Acesso:**
  - Usuários não-autenticados são redirecionados à tela de login.
  - Usuários autenticados comuns recebem a tela de bloqueio *"Acesso não autorizado."* com redirecionamento seguro ao app regular.
  - Administradores autenticados recebem acesso ao `AdminLayout`.

### 9.3 Segurança Absoluta Contra Vazamento de Credenciais
- **Zero `service_role` no Frontend:** Nenhuma referência ou token com permissões de bypass (`SUPABASE_SERVICE_ROLE_KEY` ou `VITE_SUPABASE_SERVICE_ROLE_KEY`) existe no bundle do navegador. Todas as consultas administrativas utilizam o cliente padrão autenticado sujeito ao RLS.
- **Expurgo de Dados Sensíveis na Auditoria:** A gravação em `admin_audit_logs` filtra e expurga automaticamente chaves como `password`, `token`, `secret`, `apiKey` e `authorization` dos metadados JSON antes de persistir no banco.
