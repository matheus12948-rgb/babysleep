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
│   ├── auth/           # Autenticação, sessão e proteção
│   ├── baby/           # Perfis de bebês e cálculo de idade
│   ├── sleep-tracker/  # Timer de sono em tempo real e registros retroativos
│   ├── sleep-engine/   # Motor de previsão de janelas de sono e calibração
│   ├── statistics/     # Agregações, médias móveis, tendências e gráficos Recharts
│   └── journal/        # Diário do bebê, humor e memórias da família
├── hooks/              # Custom hooks: useFeeding, useDiapers, useActivities, useRoutineTimeline, useTheme
├── layouts/            # AppLayout com Header, Bottom Nav e Ação Rápida (+)
├── pages/              # Telas (Dashboard [Core], Timeline [Lazy], Stats [Lazy], Sounds [Lazy], Profile [Lazy])
├── services/           # SupabaseClient e DataService (CRUD completo)
├── types/              # Definições globais TypeScript (rotina, sono, perfis)
└── utils/              # Conversões °C/°F, formatação de amamentação e validações
```

---

## 3. Diretrizes de Comunicação e Não-Causalidade

- **Terminologia do Motor de Sono:** "Parâmetros de referência de sono", "Janela sugerida", "Previsão", "Confiança".
- **Comunicação de Rotina:** O registro de amamentação armazena a duração real e não estima volume em ml.
- **Isenção de Diagnósticos:** O registro de fraldas, temperatura e medicamentos é meramente descritivo, acompanhado do disclaimer mandatório de responsabilidade em saúde, sem prescrição ou cálculo automático de dosagens.
- **Correlações Descritivas:** Análises cruzadas expressam observações de padrões (ex.: *"Nos últimos 14 dias, 5 sonecas ocorreram dentro de 60 minutos após uma mamadeira"*) sem jamais alegar causalidade (*"A mamadeira fez o bebê dormir melhor"*).

---

## 4. Estratégia de Performance e Code Splitting (Fase 3.5)

Para garantir que o carregamento inicial em redes móveis seja instantâneo, a aplicação adota uma estratégia de particionamento dinâmico de código:

1. **Core Crítico Síncrono (Primeiro Paint):**
   - Carregado imediatamente: Layout básico, Autenticação, Provedor do Bebê Ativo, Provedor do Rastreador de Sono, e `DashboardPage`.
   - Permite que o cuidador abra a aplicação e registre sono ou visualize o status do bebê em fração de segundo.

2. **Carregamento Sob Demanda (`React.lazy` + `Suspense`):**
   - `StatsPage`: Carregado apenas quando o usuário clica na aba de Estatísticas.
   - `SoundsPage`: Carregado apenas na aba de Sons.
   - `TimelinePage`: Carregado apenas na aba de Linha do Tempo.
   - `ProfilePage`: Carregado apenas na aba de Perfil/Configurações.
   - `OnboardingView`: Carregado apenas se o usuário não possuir bebês cadastrados ou estiver adicionando um novo bebê.
   - Fallback gracioso com `PageLoader` apresentando indicador minimalista e temático sem saltos de layout.

3. **Isolamento de Bibliotecas Pesadas (`manualChunks` no Vite/Rollup):**
   - `vendor-recharts`: Todo o ecossistema do Recharts e suas dependências matemáticas (d3-shape, victory-vendor, etc.) foi isolado em chunk próprio (`vendor-recharts-[hash].js`), não consumindo banda no carregamento inicial.
   - `vendor-supabase`: Biblioteca do cliente Supabase isolada para cache HTTP eficiente.
   - **Resultado:** Redução do JavaScript de entrada de **877.28 KB (242.42 KB gzip)** para **381.01 KB (106.48 KB gzip)**, uma economia de mais de **56%** na carga inicial da rede móvel.

---

## 5. Arquitetura de Áudio Procedural e Conteúdos Educativos (Fase 4)

### 5.1 Motor de Áudio Web Audio API (`SoundEngine.ts`)
- **Síntese 100% Procedural e Offline:** Todo o espectro acústico (ruído branco, rosa, marrom, sons de ondas do mar, chuva, batimentos cardíacos, shush uterino e melodias suaves) é sintetizado em tempo real utilizando nós nativos da Web Audio API (`AudioBufferSourceNode`, `BiquadFilterNode`, `GainNode`, `OscillatorNode`).
- **Zero Assets Externos:** Elimina a necessidade de downloads de dezenas de megabytes de arquivos `.mp3`/`.wav`, garantindo carregamento instantâneo e funcionamento mesmo em modo avião ou sem conexão.
- **Fade-Out Gradual Programável:** Utiliza rampas exponenciais e lineares no nó mestre de ganho (`masterGain.gain.linearRampToValueAtTime`) nos últimos 1 a 5 minutos configurados, reduzindo suavemente o volume para zero e evitando despertares de susto em bebês no sono leve.
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
- **`VIEWER`:** Avós, tios, observadores externos e pediatra. Possui permissão estritamente de leitura (linha do tempo, estatísticas descritivas e status do bebê). Todas as mutações são bloqueadas no cliente e no PostgreSQL via RLS (`can_edit_baby`).

### 6.2 Ciclo de Vida de Convites (`caregiver_invitations`)
- Códigos alfanuméricos curtos e legíveis (`BS-XXXX`) com expiração automática em 7 dias.
- Proteção contra reutilização (`status: 'ACCEPTED'`), verificação de validade temporal e revogação imediata pelo `OWNER`.
- Modais de interface intuitivos: [`InviteCaregiverModal.tsx`](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/src/features/caregiver/InviteCaregiverModal.tsx) (para gerar e copiar código/link) e [`JoinBabyModal.tsx`](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/src/features/caregiver/JoinBabyModal.tsx) (para aceitar convite digitando o código).

### 6.3 Sincronização em Tempo Real (`useBabyRealtime.ts`)
- Escuta ativa em canais Supabase Realtime (`postgres_changes`) filtrados por `baby_id` para tabelas de sono, alimentação, fraldas, atividades e cuidadores.
- Propagação de eventos instantânea entre dispositivos móveis da família com feedback visual sutil ("🟢 Conectado ao vivo" / "🟡 Modo Local").

### 6.4 Modelo de Assinaturas & Paywall (`SubscriptionContext.tsx`)
- Modelo híbrido `FREE` vs `PREMIUM` (mensal ou anual com 33% de desconto) gerenciado no Supabase (`user_subscriptions`) com fallback persistente no `localStorage`.
- Modal Paywall de alta conversão [`PremiumUpgradeModal.tsx`](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/src/features/subscription/PremiumUpgradeModal.tsx) com checkout simulado/sandbox de 7 dias grátis.

### 6.5 Relatório Consolidado para o Pediatra (`PediatricReportModal.tsx`)
- Consolidação clínica descritiva dos últimos 7, 14 ou 30 dias com médias diárias de sono, sonecas, mamadas, volume de mamadeiras, fraldas de xixi/cocô e notas de intercorrências.
- Suporte a cópia de texto formatado (ideal para WhatsApp do médico) e impressão direta em PDF.

---

## 7. Arquitetura PWA Avançada, Notificações & MediaSession (Fase 6)

### 7.1 Web App Manifest & Instalação Standalone (`public/manifest.webmanifest`)
- **Configuração:** `display: standalone`, `orientation: portrait-primary`, cores temáticas (`theme_color: #1e1b4b`, `background_color: #0f172a`), ícones de 192px e 512px com propósito `maskable any`.
- **Atalhos Rápidos de Aplicativo (Shortcuts):** Permite acesso direto pela tela inicial aos fluxos de "Registrar Sono" e "Amamentação".
- **Banner Customizado (`PWAInstallBanner.tsx`):** Captura do evento `beforeinstallprompt` via `PWAService.ts`, suprimindo popups intrusivos e oferecendo banner flutuante elegante com persistência de recusa via `localStorage`.

### 7.2 Service Worker & Cache Offline Resiliente (`public/sw.js`)
- **Precache do App Shell:** Chave de versão `babysleep-cache-v1` armazenando arquivos essenciais no evento `install` com `skipWaiting()`.
- **Estratégias de Cache:**
  - **Stale-While-Revalidate:** Para estilos, scripts empacotados, ícones e fontes, servindo a versão em cache instantaneamente enquanto busca atualizações em segundo plano.
  - **Network-First:** Para rotas de navegação HTML, garantindo que o usuário veja o estado mais recente quando online e preservando o app shell offline.
- **Limpeza Automática:** Remoção de versões legadas de cache durante a ativação (`activate`) com `clients.claim()`.
- **Suporte a Push e Background Sync:** Listeners de `push` e `notificationclick` com redirecionamento de foco para a aba do aplicativo.

### 7.3 Motor de Notificações & Horário Silencioso (`NotificationService.ts`)
- **Antecedência Configurável:** Lembretes proativos disparados com 5, 10, 15 ou 30 minutos de antecedência da estimativa da próxima soneca do bebê.
- **Tratamento Algorítmico de Horário Silencioso (`isInQuietHours`):**
  - Trata com precisão intervalos noturnos que cruzam a meia-noite (ex.: `22:00` às `06:30`), além de intervalos diurnos convencionais.
  - Bloqueia silenciosamente alertas de janelas durante o repouso noturno da família.
- **Duplo Canal de Envio:** Disparo primário via `registration.showNotification` no Service Worker para entrega em segundo plano e fallback nativo na Web Notification API.

### 7.4 Áudio em Segundo Plano & MediaSession API (`SoundEngine.ts`)
- **Sincronização com o Sistema Operacional:** Atualização de metadados (`MediaMetadata`) com nome do som, arte visual e autor ao iniciar ou pausar faixas procedurais.
- **Controles Físicos e Lockscreen:** Mapeamento das ações `play`, `pause` e `stop` aos botões de fones de ouvido (Bluetooth/cabo) e controles da tela de bloqueio de smartphones iOS e Android.
- **Persistência Acústica:** Mantém o loop sonoro contínuo e sem interrupções mesmo quando o usuário bloqueia a tela do aparelho móvel.

---

## 8. Acessibilidade WCAG 2.1 AA, Segurança & Resiliência (Fase 7)

### 8.1 Acessibilidade Digital (WCAG 2.1 AA)
- **Estrutura Semântica:** Adoção de elementos HTML5 semânticos (`<header>`, `<main role="main">`, `<nav aria-label="Navegação principal">`).
- **Compatibilidade com Leitores de Tela:** Atributos `aria-label`, `aria-current="page"`, `aria-haspopup="dialog"` e `aria-modal="true"` em todos os botões e janelas de diálogo.
- **Navegação por Teclado:** Suporte completo à tecla `Escape` para fechamento de modais e anéis de foco visíveis (`focus-visible:ring-2 focus-visible:ring-indigo-500`) em todos os componentes interativos.
- **Status de Rede Discreto:** Componente [`NetworkStatusIndicator.tsx`](file:///c:/Users/mathe/OneDrive/Documentos/projetos/Clone%20Napper/src/components/ui/NetworkStatusIndicator.tsx) com `role="status"` e `aria-live="polite"` que informa transições de conectividade sem interromper a navegação assistiva.

### 8.2 Segurança da Aplicação e Prevenção de XSS (`src/utils/security.ts`)
- **Sanitização de Dados:** Função `sanitizeInput` aplicada em notas de rotina, diário e cadastros, neutralizando tags executáveis (`<script>`, `<style>`, `<iframe>`), manipuladores de eventos in-line (`onerror=`, `onclick=`) e pseudo-protocolos perigosos (`javascript:`).
- **Escape de Entidades:** Função `escapeHtml` para codificação estrita de entidades sensíveis antes de qualquer renderização textual.
- **Higienização de Sessão:** Procedimento `secureSignOutCleanup` que purga dados de cache do bebê e perfis de usuário ao deslogar, mantendo unicamente preferências locais de hardware/interface (volume, tema, dismiss de PWA).

### 8.3 Resiliência e Tolerância a Falhas (`ErrorBoundary.tsx`)
- **Barreira Global de Exceções:** Envolve toda a árvore de contextos da aplicação, capturando erros de ciclo de vida (`componentDidCatch` e `getDerivedStateFromError`).
- **Experiência de Recuperação:** Tela de contingência acolhedora com acessibilidade auditada (`role="alert"`, `aria-live="assertive"`), orientando o cuidador e oferecendo botões de recarga e retorno à página inicial sem perda de dados locais.
