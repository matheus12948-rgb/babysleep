/**
 * BabySleep - Testes Automatizados de Validação Técnica da FASE 4
 * Sons para Dormir (Web Audio Procedural), Fade-out Gradual, Mini Player & Hub Educativo
 */

import fs from 'node:fs';
import path from 'node:path';
import { SOUND_LIBRARY, SoundEngine } from '../src/features/sounds/SoundEngine';
import { COURSES, ARTICLES } from '../src/features/education/educationData';
import { DataService } from '../src/services/DataService';
import { UserEducationProgress } from '../src/features/education/types';

// Mock de localStorage para ambiente Node.js de teste
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
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
console.log('  INICIANDO BATERIA DE TESTES TÉCNICOS — FASE 4');
console.log('  Sons para Dormir, Fade-Out e Conteúdo Educacional');
console.log('======================================================\n');

// -----------------------------------------------------------
// TESTE 1: Biblioteca de Sons Procedurais Web Audio (SoundEngine)
// -----------------------------------------------------------
console.log('--- TESTE 1: Validação do SoundEngine e Biblioteca de 12 Faixas ---');
{
  assert(SOUND_LIBRARY.length >= 12, `SOUND_LIBRARY contém pelo menos 12 faixas (encontradas: ${SOUND_LIBRARY.length})`);

  const expectedTrackIds = [
    'white-noise',
    'pink-noise',
    'brown-noise',
    'gentle-fan',
    'hairdryer',
    'gentle-rain',
    'ocean-waves',
    'serene-forest',
    'mountain-stream',
    'heartbeat',
    'womb-shush',
    'lullaby-synth'
  ];

  expectedTrackIds.forEach(id => {
    const exists = SOUND_LIBRARY.some(t => t.id === id);
    assert(exists, `Faixa de som obrigatória '${id}' cadastrada`);
  });

  // Validar metadados de cada faixa
  SOUND_LIBRARY.forEach(track => {
    assert(Boolean(track.name && track.category && track.icon && track.description), `Faixa '${track.id}' tem nome, categoria, ícone e descrição`);
  });

  // Singleton do SoundEngine
  const engine1 = SoundEngine.getInstance();
  const engine2 = SoundEngine.getInstance();
  assert(engine1 === engine2, 'SoundEngine opera sob padrão Singleton estrito');

  // Teste de clamp de volume
  engine1.setVolume(1.5);
  assert(engine1.getVolume() <= 1.0, 'Volume acima de 1.0 é limitado a 1.0');
  engine1.setVolume(-0.2);
  assert(engine1.getVolume() >= 0.0, 'Volume negativo é limitado a 0.0');
  engine1.setVolume(0.7);
  assert(Math.abs(engine1.getVolume() - 0.7) < 0.001, 'Volume 0.7 aplicado com sucesso');

  // Teste de método fade-out
  assert(typeof engine1.applyGradualFadeOut === 'function', 'SoundEngine possui método applyGradualFadeOut');
}

// -----------------------------------------------------------
// TESTE 2: Módulo Educativo — Cursos e Lições Estruturadas
// -----------------------------------------------------------
console.log('\n--- TESTE 2: Cursos e Lições Estruturadas por Faixa Etária ---');
{
  assert(COURSES.length >= 4, `Módulo possui pelo menos 4 cursos (encontrados: ${COURSES.length})`);

  const expectedCourseIds = ['course-newborn', 'course-4months', 'course-routine', 'course-feeding-sleep'];
  expectedCourseIds.forEach(id => {
    const course = COURSES.find(c => c.id === id);
    assert(Boolean(course), `Curso '${id}' cadastrado`);
    if (course) {
      assert(course.lessons.length >= 2, `Curso '${id}' possui ao menos 2 aulas (encontradas: ${course.lessons.length})`);
      assert(Boolean(course.ageRange), `Curso '${id}' define faixa etária recomendada`);
    }
  });

  // Validação detalhada das aulas
  let totalLessons = 0;
  COURSES.forEach(course => {
    course.lessons.forEach(lesson => {
      totalLessons++;
      assert(lesson.durationMinutes > 0, `Aula '${lesson.id}' tem duração estimada > 0 min (${lesson.durationMinutes} min)`);
      assert(lesson.summary.length > 20, `Aula '${lesson.id}' tem resumo conciso`);
      assert(lesson.content.length > 100, `Aula '${lesson.id}' tem conteúdo educativo detalhado`);
      assert(lesson.keyTakeaways && lesson.keyTakeaways.length >= 2, `Aula '${lesson.id}' possui pontos-chave para fixação`);
    });
  });
  assert(totalLessons >= 10, `Total de aulas cadastradas >= 10 (encontradas: ${totalLessons})`);
}

// -----------------------------------------------------------
// TESTE 3: Biblioteca de Artigos Educativos e Busca por Tags
// -----------------------------------------------------------
console.log('\n--- TESTE 3: Biblioteca Temática de Artigos e Tags ---');
{
  assert(ARTICLES.length >= 6, `Biblioteca possui ao menos 6 artigos (encontrados: ${ARTICLES.length})`);

  ARTICLES.forEach(art => {
    assert(Boolean(art.id && art.title && art.subtitle && art.summary), `Artigo '${art.id}' tem título, subtítulo e resumo`);
    assert(art.readTimeMinutes > 0, `Artigo '${art.id}' tem tempo de leitura estimado`);
    assert(['sleep', 'leaps', 'feeding', 'wellbeing'].includes(art.category), `Artigo '${art.id}' tem categoria válida (${art.category})`);
    assert(art.tags.length >= 2, `Artigo '${art.id}' possui ao menos 2 tags temáticas`);
  });

  // Testar busca e filtros por tag
  const searchTestQuery = 'cortisol';
  const foundByQuery = ARTICLES.filter(a => 
    a.title.toLowerCase().includes(searchTestQuery) || 
    a.content.toLowerCase().includes(searchTestQuery) ||
    a.tags.includes(searchTestQuery)
  );
  assert(foundByQuery.length > 0, `Busca textual por termo pediátrico '${searchTestQuery}' retorna resultados`);
}

// -----------------------------------------------------------
// TESTE 4: Persistência de Progresso no DataService
// -----------------------------------------------------------
console.log('\n--- TESTE 4: Persistência de Progresso do Cuidador no DataService ---');
(async () => {
  const testUserId = 'test-caregiver-user-4';

  // 1. Verificar lista inicial vazia
  const initial = await DataService.getEducationProgress(testUserId);
  assert(initial.length === 0, 'Progresso inicial do usuário de teste está vazio');

  // 2. Salvar conclusão de aula
  const progressRecord: UserEducationProgress = {
    id: `edu-temp-${Date.now()}`,
    userId: testUserId,
    contentType: 'LESSON',
    contentId: 'lesson-newborn-1',
    courseId: 'course-newborn',
    isCompleted: true,
    isBookmarked: false,
    lastReadAt: new Date().toISOString()
  };

  const saved = await DataService.saveEducationProgress(progressRecord);
  assert(saved.isCompleted === true, 'Progresso de aula concluída salvo com sucesso');

  // 3. Recuperar progresso persistido
  const retrieved = await DataService.getEducationProgress(testUserId);
  assert(retrieved.length === 1, 'Progresso recuperado contém 1 registro');
  assert(retrieved[0].contentId === 'lesson-newborn-1' && retrieved[0].isCompleted === true, 'Dados da aula concluída conferem');

  // 4. Salvar favorito de artigo
  const articleBookmark: UserEducationProgress = {
    id: `edu-temp-art-${Date.now()}`,
    userId: testUserId,
    contentType: 'ARTICLE',
    contentId: 'art-wake-windows',
    isCompleted: false,
    isBookmarked: true,
    lastReadAt: new Date().toISOString()
  };
  await DataService.saveEducationProgress(articleBookmark);

  const afterBookmark = await DataService.getEducationProgress(testUserId);
  assert(afterBookmark.length === 2, 'Dois registros persistidos (1 aula e 1 artigo favorito)');
  const bookmarkedArt = afterBookmark.find(p => p.contentId === 'art-wake-windows');
  assert(Boolean(bookmarkedArt && bookmarkedArt.isBookmarked), 'Artigo marcado como favorito persistido com sucesso');

  // -----------------------------------------------------------
  // TESTE 5: Integridade dos Arquivos e Componentes da FASE 4
  // -----------------------------------------------------------
  console.log('\n--- TESTE 5: Arquitetura de Componentes da FASE 4 ---');
  {
    const filesToCheck = [
      'supabase/migrations/20261003_phase4_education.sql',
      'src/features/sounds/SoundEngine.ts',
      'src/features/sounds/SoundContext.tsx',
      'src/features/sounds/MiniSoundPlayer.tsx',
      'src/features/education/types.ts',
      'src/features/education/educationData.ts',
      'src/features/education/useEducation.ts',
      'src/features/education/LessonReaderModal.tsx',
      'src/features/education/ArticleReaderModal.tsx',
      'src/pages/SoundsPage.tsx'
    ];

    filesToCheck.forEach(relPath => {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert(fs.existsSync(fullPath), `Arquivo essencial existe: ${relPath}`);
    });

    // Verificar integração no AppLayout
    const layoutContent = fs.readFileSync(path.resolve(process.cwd(), 'src/layouts/AppLayout.tsx'), 'utf-8');
    assert(layoutContent.includes('MiniSoundPlayer'), 'MiniSoundPlayer integrado ao AppLayout');

    // Verificar integração no App.tsx
    const appContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
    assert(appContent.includes('SoundProvider'), 'SoundProvider envolve a aplicação em App.tsx');

    // Verificar disclaimers de parâmetros de referência em SoundsPage
    const soundsContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/SoundsPage.tsx'), 'utf-8');
    assert(soundsContent.includes('SOUND_LIBRARY'), 'SoundsPage consome a SOUND_LIBRARY procedural');
    assert(soundsContent.includes('fade'), 'SoundsPage oferece controle de fade-out');
  }

  // -----------------------------------------------------------
  // RELATÓRIO FINAL DA BATERIA
  // -----------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  RESULTADO FASE 4: ${passedTests}/${totalTests} testes aprovados`);
  if (failedTests === 0) {
    console.log('  🎉 TODOS OS TESTES DA FASE 4 PASSARAM COM SUCESSO!');
  } else {
    console.error(`  ⚠️ ${failedTests} testes falharam.`);
    failureDetails.forEach(f => console.error(f));
    process.exit(1);
  }
  console.log('======================================================\n');
})();
