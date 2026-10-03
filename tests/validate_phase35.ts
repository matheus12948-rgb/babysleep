/**
 * BabySleep - Testes Automatizados de Validação Técnica da FASE 3.5
 * Performance, Code Splitting, Lazy Loading e Integridade Arquitetural
 */

import fs from 'node:fs';
import path from 'node:path';

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
console.log('  INICIANDO BATERIA DE TESTES TÉCNICOS — FASE 3.5');
console.log('  Performance, Code Splitting e Otimização do Bundle');
console.log('======================================================\n');

// -----------------------------------------------------------
// TESTE 1: Configuração do Code Splitting e Vite
// -----------------------------------------------------------
console.log('--- TESTE 1: Configuração de Manual Chunks e Vite ---');
{
  const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
  assert(fs.existsSync(viteConfigPath), 'Arquivo vite.config.ts existe');

  const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8');
  assert(viteConfigContent.includes('manualChunks'), 'manualChunks configurado em rollupOptions');
  assert(viteConfigContent.includes('vendor-recharts'), 'Chunk isolado para Recharts configurado');
  assert(viteConfigContent.includes('vendor-supabase'), 'Chunk isolado para Supabase configurado');
}

// -----------------------------------------------------------
// TESTE 2: Lazy Loading e Suspense em App.tsx
// -----------------------------------------------------------
console.log('\n--- TESTE 2: Implementação de React.lazy e Suspense em App.tsx ---');
{
  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');

  assert(appContent.includes('lazy('), 'React.lazy implementado');
  assert(appContent.includes('Suspense'), 'React.Suspense implementado');
  assert(appContent.includes('PageLoader'), 'PageLoader utilizado como fallback');

  // Verificar quais páginas estão em code splitting
  assert(appContent.includes("import('@/pages/StatsPage')"), 'StatsPage carregado sob demanda (lazy)');
  assert(appContent.includes("import('@/pages/SoundsPage')"), 'SoundsPage carregado sob demanda (lazy)');
  assert(appContent.includes("import('@/pages/TimelinePage')"), 'TimelinePage carregado sob demanda (lazy)');
  assert(appContent.includes("import('@/pages/ProfilePage')"), 'ProfilePage carregado sob demanda (lazy)');
  assert(appContent.includes("import('@/features/onboarding/OnboardingView')"), 'OnboardingView carregado sob demanda (lazy)');

  // DashboardPage deve permanecer no core para primeiro carregamento ultrarrápido
  assert(appContent.includes("import { DashboardPage }"), 'DashboardPage mantido no bundle inicial para primeiro paint imediato');
}

// -----------------------------------------------------------
// TESTE 3: Desacoplamento do Recharts do Bundle Inicial
// -----------------------------------------------------------
console.log('\n--- TESTE 3: Desacoplamento do Recharts do Bundle Inicial ---');
{
  const dashboardPath = path.resolve(process.cwd(), 'src/pages/DashboardPage.tsx');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');
  assert(!dashboardContent.includes('recharts'), 'Dashboard NÃO importa recharts diretamente');

  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');
  assert(!appContent.includes("from 'recharts'"), 'App.tsx NÃO importa recharts diretamente');

  const distDir = path.resolve(process.cwd(), 'dist/assets');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    const rechartsChunk = files.find(f => f.startsWith('vendor-recharts'));
    assert(!!rechartsChunk, 'Chunk dedicado vendor-recharts gerado em dist/assets');
  } else {
    console.log('  ℹ (dist/assets será checado após build)');
  }
}

// -----------------------------------------------------------
// TESTE 4: Componentes de Fallback e Estilização
// -----------------------------------------------------------
console.log('\n--- TESTE 4: Componente PageLoader para Fallback ---');
{
  const loaderPath = path.resolve(process.cwd(), 'src/components/ui/PageLoader.tsx');
  assert(fs.existsSync(loaderPath), 'Componente PageLoader criado em src/components/ui/');

  const loaderContent = fs.readFileSync(loaderPath, 'utf-8');
  assert(loaderContent.includes('animate-spin'), 'Animação de carregamento presente no PageLoader');
  assert(loaderContent.includes('PageLoaderProps'), 'Tipagem de props do PageLoader estrita');
}

// -----------------------------------------------------------
// TESTE 5: Preservação de Interfaces e Módulos Secundários
// -----------------------------------------------------------
console.log('\n--- TESTE 5: Preservação de Exports e Módulos das Páginas ---');
{
  // StatsPage
  const statsPath = path.resolve(process.cwd(), 'src/pages/StatsPage.tsx');
  const statsContent = fs.readFileSync(statsPath, 'utf-8');
  assert(statsContent.includes('export const StatsPage'), 'StatsPage export preservado');
  assert(statsContent.includes('TotalSleepChart'), 'Componentes de gráficos de sono preservados');
  assert(statsContent.includes('DayVsNightChart'), 'DayVsNightChart preservado');
  assert(statsContent.includes('PredictionAccuracyChart'), 'PredictionAccuracyChart preservado');

  // TimelinePage
  const timelinePath = path.resolve(process.cwd(), 'src/pages/TimelinePage.tsx');
  const timelineContent = fs.readFileSync(timelinePath, 'utf-8');
  assert(timelineContent.includes('export const TimelinePage'), 'TimelinePage export preservado');
  assert(timelineContent.includes('useRoutineTimeline'), 'Hook unificador da timeline preservado');

  // SoundsPage
  const soundsPath = path.resolve(process.cwd(), 'src/pages/SoundsPage.tsx');
  const soundsContent = fs.readFileSync(soundsPath, 'utf-8');
  assert(soundsContent.includes('export const SoundsPage'), 'SoundsPage export preservado');

  // ProfilePage
  const profilePath = path.resolve(process.cwd(), 'src/pages/ProfilePage.tsx');
  const profileContent = fs.readFileSync(profilePath, 'utf-8');
  assert(profileContent.includes('export const ProfilePage'), 'ProfilePage export preservado');
}

// -----------------------------------------------------------
// TESTE 6: Métricas do Bundle em dist/
// -----------------------------------------------------------
console.log('\n--- TESTE 6: Análise de Tamanho do Bundle ---');
{
  const distDir = path.resolve(process.cwd(), 'dist/assets');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    const mainJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
    if (mainJs) {
      const stats = fs.statSync(path.join(distDir, mainJs));
      const sizeKb = stats.size / 1024;
      console.log(`  Tamanho do entry chunk (${mainJs}): ${sizeKb.toFixed(2)} KB`);
      assert(sizeKb < 500, `Entry chunk reduzido com sucesso para ${sizeKb.toFixed(2)} KB (< 500 KB)`);
    } else {
      assert(false, 'Entry chunk index-*.js não encontrado');
    }
  }
}

// -----------------------------------------------------------
// RESULTADO FINAL
// -----------------------------------------------------------
console.log('\n======================================================');
console.log(`  RESULTADO DOS TESTES — FASE 3.5`);
console.log(`  Total de Testes: ${totalTests}`);
console.log(`  Aprovados:       ${passedTests}`);
console.log(`  Falhas:          ${failedTests}`);
console.log('======================================================\n');

if (failedTests > 0) {
  console.error('Erros encontrados:');
  failureDetails.forEach(f => console.error(f));
  process.exit(1);
} else {
  console.log('🎉 TODOS OS TESTES DA FASE 3.5 PASSARAM COM SUCESSO!\n');
  process.exit(0);
}
