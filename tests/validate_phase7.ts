/**
 * BabySleep - Testes Automatizados de Validação Técnica da FASE 7
 * Polimento, Acessibilidade WCAG 2.1 AA, Segurança / Prevenção XSS, ErrorBoundary & SEO
 */

import fs from 'node:fs';
import path from 'node:path';
import { sanitizeInput, escapeHtml, isValidName, secureSignOutCleanup } from '../src/utils/security';

// Mock de localStorage para testes
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
    get length() { return Object.keys(mockStorage).length; },
    key: (index: number) => Object.keys(mockStorage)[index] || null,
  };
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    const msg = `  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`;
    console.error(msg);
    failureDetails.push(msg);
  }
}

console.log('\n======================================================');
console.log('  INICIANDO BATERIA DE TESTES TÉCNICOS — FASE 7');
console.log('  Acessibilidade WCAG, Segurança/XSS, Error Boundary & SEO');
console.log('======================================================\n');

(async () => {
  // -----------------------------------------------------------
  // TESTE 1: Segurança, Sanitização de Inputs e Prevenção de XSS
  // -----------------------------------------------------------
  console.log('--- TESTE 1: Módulo de Segurança e Sanitização contra XSS ---');
  {
    // 1. Sanitização de scripts maliciosos
    const xssScript = 'Meu bebê dormiu bem <script>alert("hack")</script> após a mamada';
    const cleanScript = sanitizeInput(xssScript);
    assert(!cleanScript.includes('<script>'), 'sanitizeInput remove tag <script>');
    assert(!cleanScript.includes('alert("hack")'), 'sanitizeInput remove corpo de scripts executáveis');
    assert(cleanScript.includes('Meu bebê dormiu bem'), 'sanitizeInput preserva o texto legítimo');

    // 2. Sanitização de eventos inline (onerror, onload, onclick)
    const xssImg = 'Bebê acordou com fome <img src="x" onerror="stealCookies()">';
    const cleanImg = sanitizeInput(xssImg);
    assert(!cleanImg.toLowerCase().includes('onerror'), 'sanitizeInput remove manipuladores onerror');

    const xssLink = '<a href="javascript:void(0)" onclick="alert(1)">Clique aqui</a>';
    const cleanLink = sanitizeInput(xssLink);
    assert(!cleanLink.toLowerCase().includes('javascript:'), 'sanitizeInput neutraliza pseudo-protocolo javascript:');
    assert(!cleanLink.toLowerCase().includes('onclick'), 'sanitizeInput remove atributo onclick');

    // 3. Sanitização de tags iframe e style
    const xssIframe = 'Texto normal <iframe src="http://evil.com"></iframe> com estilo <style>body{display:none}</style>';
    const cleanIframe = sanitizeInput(xssIframe);
    assert(!cleanIframe.includes('<iframe'), 'sanitizeInput remove tags iframe');
    assert(!cleanIframe.includes('<style'), 'sanitizeInput remove tags style');

    // 4. Limitação de tamanho máximo (evita ataques de DoS por string gigante)
    const longString = 'a'.repeat(3000);
    const truncated = sanitizeInput(longString, 500);
    assert(truncated.length === 500, 'sanitizeInput trunca entradas que excedem maxLength');

    // 5. Função de escape de caracteres HTML
    const rawHtml = '<div class="alerta">"Theo & Mel" \'sono\'</div>';
    const escaped = escapeHtml(rawHtml);
    assert(escaped.includes('&lt;div'), 'escapeHtml escapa sinal de menor (<)');
    assert(escaped.includes('&gt;'), 'escapeHtml escapa sinal de maior (>)');
    assert(escaped.includes('&quot;'), 'escapeHtml escapa aspas duplas (")');
    assert(escaped.includes('&#x27;'), 'escapeHtml escapa aspas simples (\')');
    assert(escaped.includes('&amp;'), 'escapeHtml escapa e-comercial (&)');

    // 6. Validação de nomes seguros
    assert(isValidName('Theo') === true, 'isValidName aceita nome válido "Theo"');
    assert(isValidName('Maria Alice') === true, 'isValidName aceita nome composto "Maria Alice"');
    assert(isValidName('A') === false, 'isValidName rejeita nome com menos de 2 caracteres');
    assert(isValidName('') === false, 'isValidName rejeita string vazia');
    assert(isValidName('   ') === false, 'isValidName rejeita apenas espaços em branco');
    assert(isValidName('x'.repeat(70)) === false, 'isValidName rejeita nome acima de 60 caracteres');
  }

  // -----------------------------------------------------------
  // TESTE 2: Limpeza Segura de Sessão (Secure Sign Out)
  // -----------------------------------------------------------
  console.log('\n--- TESTE 2: Limpeza Segura de Sessão (Secure Sign Out) ---');
  {
    localStorage.clear();
    localStorage.setItem('babysleep_user_profile', '{"id":"usr-123"}');
    localStorage.setItem('babysleep_active_baby_id', 'baby-123');
    localStorage.setItem('babysleep_theme', 'dark');
    localStorage.setItem('babysleep_sound_volume', '0.75');
    localStorage.setItem('babysleep_sound_fadeout', '3');
    localStorage.setItem('babysleep_pwa_install_dismissed', 'true');
    localStorage.setItem('babysleep_cached_sleep_baby-123', '[{}]');

    secureSignOutCleanup();

    assert(localStorage.getItem('babysleep_user_profile') === null, 'Perfil de usuário removido no sign out');
    assert(localStorage.getItem('babysleep_active_baby_id') === null, 'ID do bebê ativo purgado');
    assert(localStorage.getItem('babysleep_cached_sleep_baby-123') === null, 'Cache sensível de sono purgado');
    assert(localStorage.getItem('babysleep_theme') === 'dark', 'Tema visual preferido preservado');
    assert(localStorage.getItem('babysleep_sound_volume') === '0.75', 'Volume de áudio preferido preservado');
    assert(localStorage.getItem('babysleep_sound_fadeout') === '3', 'Configuração de fade-out preservada');
    assert(localStorage.getItem('babysleep_pwa_install_dismissed') === 'true', 'Preferência de banner PWA preservada');
  }

  // -----------------------------------------------------------
  // TESTE 3: Acessibilidade Semântica (WCAG 2.1 AA) no Layout & Modais
  // -----------------------------------------------------------
  console.log('\n--- TESTE 3: Acessibilidade Semântica e Conformidade WCAG ---');
  {
    const appLayoutPath = path.resolve(process.cwd(), 'src/layouts/AppLayout.tsx');
    const layoutContent = fs.readFileSync(appLayoutPath, 'utf-8');

    // Landmarks semânticos
    assert(layoutContent.includes('<header'), 'AppLayout possui landmark semântico <header>');
    assert(layoutContent.includes('<main className="flex-1') && layoutContent.includes('role="main"'), 'AppLayout possui landmark semântico <main role="main">');
    assert(layoutContent.includes('<nav') && layoutContent.includes('aria-label="Navegação principal"'), 'AppLayout possui landmark semântico <nav> com aria-label');

    // Botões com aria-label e aria-current
    assert(layoutContent.includes('aria-label="Aba Início"'), 'Aba Início possui aria-label acessível');
    assert(layoutContent.includes('aria-label="Aba Rotina e Linha do Tempo"'), 'Aba Rotina possui aria-label acessível');
    assert(layoutContent.includes('aria-label="Aba Estatísticas de Sono e Rotina"'), 'Aba Estatísticas possui aria-label acessível');
    assert(layoutContent.includes('aria-label="Aba Sons e Músicas de Ninar"'), 'Aba Sons possui aria-label acessível');
    assert(layoutContent.includes('aria-current={currentTab ==='), 'Abas de navegação possuem aria-current dinâmico para leitores de tela');
    assert(layoutContent.includes('aria-label="Abrir menu de registro rápido de atividades"'), 'Botão flutuante central possui aria-label descritivo');
    assert(layoutContent.includes('aria-label="Perfil e Configurações"'), 'Botão de perfil possui aria-label');
    assert(layoutContent.includes('focus-visible:ring-2'), 'Navegação possui anéis de foco visíveis para navegação por teclado');

    // Modal acessível
    const modalPath = path.resolve(process.cwd(), 'src/components/ui/Modal.tsx');
    const modalContent = fs.readFileSync(modalPath, 'utf-8');
    assert(modalContent.includes('role="dialog"'), 'Modal implementa role="dialog"');
    assert(modalContent.includes('aria-modal="true"'), 'Modal implementa aria-modal="true"');
    assert(modalContent.includes("e.key === 'Escape'"), 'Modal implementa suporte a tecla Escape para fechar');
    assert(modalContent.includes('aria-label="Fechar janela"'), 'Botão fechar do modal possui aria-label');

    // Network status
    const netPath = path.resolve(process.cwd(), 'src/components/ui/NetworkStatusIndicator.tsx');
    const netContent = fs.readFileSync(netPath, 'utf-8');
    assert(netContent.includes('role="status"'), 'NetworkStatusIndicator possui role="status"');
    assert(netContent.includes('aria-live="polite"'), 'NetworkStatusIndicator possui aria-live="polite" para não interromper leitores de tela');
  }

  // -----------------------------------------------------------
  // TESTE 4: ErrorBoundary Global e Resiliência
  // -----------------------------------------------------------
  console.log('\n--- TESTE 4: ErrorBoundary Global e Resiliência a Exceções ---');
  {
    const ebPath = path.resolve(process.cwd(), 'src/components/ui/ErrorBoundary.tsx');
    assert(fs.existsSync(ebPath), 'src/components/ui/ErrorBoundary.tsx existe');

    const ebContent = fs.readFileSync(ebPath, 'utf-8');
    assert(ebContent.includes('componentDidCatch'), 'ErrorBoundary implementa componentDidCatch');
    assert(ebContent.includes('getDerivedStateFromError'), 'ErrorBoundary implementa getDerivedStateFromError');
    assert(ebContent.includes('role="alert"'), 'Tela de fallback do ErrorBoundary possui role="alert"');
    assert(ebContent.includes('aria-live="assertive"'), 'Tela de fallback possui aria-live="assertive"');
    assert(ebContent.includes('handleReload'), 'ErrorBoundary oferece botão de recarregar');
    assert(ebContent.includes('handleReset'), 'ErrorBoundary oferece botão de retorno à tela inicial');

    const appPath = path.resolve(process.cwd(), 'src/App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');
    assert(appContent.includes('<ErrorBoundary>'), 'App.tsx envolve a árvore de aplicação com ErrorBoundary');
  }

  // -----------------------------------------------------------
  // TESTE 5: Otimização de SEO, Metadados e OpenGraph no index.html
  // -----------------------------------------------------------
  console.log('\n--- TESTE 5: SEO, OpenGraph e Metadados de Produção ---');
  {
    const indexPath = path.resolve(process.cwd(), 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    assert(indexContent.includes('name="robots" content="index, follow"'), 'index.html define meta robots index/follow');
    assert(indexContent.includes('property="og:type" content="website"'), 'index.html define og:type website');
    assert(indexContent.includes('property="og:title"'), 'index.html define og:title');
    assert(indexContent.includes('property="og:description"'), 'index.html define og:description');
    assert(indexContent.includes('property="og:locale" content="pt_BR"'), 'index.html define og:locale pt_BR');
    assert(indexContent.includes('name="twitter:card" content="summary_large_image"'), 'index.html define twitter:card');
    assert(indexContent.includes('name="format-detection" content="telephone=no"'), 'index.html desativa detecção indesejada de telefones');
    assert(indexContent.includes('lang="pt-BR"'), 'index.html define atributo lang="pt-BR" correto');
  }

  // -----------------------------------------------------------
  // TESTE 6: Arquitetura Final Completa do Sistema
  // -----------------------------------------------------------
  console.log('\n--- TESTE 6: Integridade Arquitetural Final ---');
  {
    const filesToCheck = [
      'src/utils/security.ts',
      'src/components/ui/ErrorBoundary.tsx',
      'src/components/ui/NetworkStatusIndicator.tsx',
      'src/components/ui/Modal.tsx',
      'src/layouts/AppLayout.tsx',
      'src/App.tsx',
      'index.html',
      'ROADMAP.md',
      'ARCHITECTURE.md'
    ];

    filesToCheck.forEach(relPath => {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert(fs.existsSync(fullPath), `Arquivo essencial existe: ${relPath}`);
    });
  }

  // -----------------------------------------------------------
  // RELATÓRIO FINAL DA BATERIA
  // -----------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  RESULTADO FASE 7: ${passedTests}/${totalTests} testes aprovados`);
  if (failedTests === 0) {
    console.log('  🎉 TODOS OS TESTES DA FASE 7 PASSARAM COM SUCESSO!');
  } else {
    console.error(`  ⚠️ ${failedTests} testes falharam.`);
    failureDetails.forEach(f => console.error(f));
    process.exit(1);
  }
  console.log('======================================================\n');
})();
