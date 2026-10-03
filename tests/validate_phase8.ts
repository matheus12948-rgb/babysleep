/**
 * BabySleep - Testes Automatizados de Validação Técnica da FASE 8
 * Painel Administrativo, Segurança, RLS, Auditoria, Gestão e Relatórios
 */

import fs from 'node:fs';
import path from 'node:path';
import { AdminDataService } from '../src/services/adminDataService';
import { UserProfile } from '../src/types';

// Mock de localStorage para testes em Node.js
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
console.log('  INICIANDO BATERIA DE TESTES TÉCNICOS — FASE 8');
console.log('  Painel Administrativo Completo, Segurança & Auditoria');
console.log('======================================================\n');

(async () => {
  // -----------------------------------------------------------
  // TESTE 1: Segurança de Acesso e Papéis de Usuário (USER vs ADMIN)
  // -----------------------------------------------------------
  console.log('--- TESTE 1: Segurança de Autorização e Validação de Papel ---');
  {
    localStorage.clear();

    // 1. Usuário não autenticado
    const nonAuthIsAdmin = await AdminDataService.checkIsAdmin('');
    assert(nonAuthIsAdmin === false, 'checkIsAdmin retorna false para usuário vazio / não autenticado');

    // 2. Usuário comum (role: USER, isAdmin: false)
    const commonUser: UserProfile = {
      id: 'usr-common-01',
      email: 'comum@babysleep.app',
      fullName: 'Cuidador Comum',
      timezone: 'America/Sao_Paulo',
      role: 'USER',
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('babysleep_user_profile', JSON.stringify(commonUser));
    const commonIsAdmin = await AdminDataService.checkIsAdmin(commonUser.id);
    assert(commonIsAdmin === false, 'checkIsAdmin nega acesso administrativo para usuário com role=USER');

    // 3. Usuário Administrador (role: ADMIN)
    const adminUser: UserProfile = {
      id: 'usr-admin-01',
      email: 'admin@babysleep.app',
      fullName: 'Administrador Chefe',
      timezone: 'America/Sao_Paulo',
      role: 'ADMIN',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('babysleep_user_profile', JSON.stringify(adminUser));
    const adminIsAdmin = await AdminDataService.checkIsAdmin(adminUser.id);
    assert(adminIsAdmin === true, 'checkIsAdmin valida e concede acesso para usuário com role=ADMIN');
  }

  // -----------------------------------------------------------
  // TESTE 2: Auditoria de Segurança Contra Vazamento de Secrets
  // -----------------------------------------------------------
  console.log('\n--- TESTE 2: Auditoria Contra Vazamento de Chaves Privadas ---');
  {
    const srcDir = path.resolve(process.cwd(), 'src');
    const allFiles: string[] = [];

    const collectFiles = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          collectFiles(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          allFiles.push(fullPath);
        }
      }
    };
    collectFiles(srcDir);

    let foundServiceRole = false;
    let foundServiceRoleKey = false;

    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        foundServiceRoleKey = true;
      }
      if (content.includes('VITE_SUPABASE_SERVICE_ROLE_KEY')) {
        foundServiceRole = true;
      }
    }

    assert(!foundServiceRoleKey, 'Nenhuma referência a SUPABASE_SERVICE_ROLE_KEY no frontend (src/)');
    assert(!foundServiceRole, 'Nenhuma secret VITE_SUPABASE_SERVICE_ROLE_KEY exposta no código cliente');
  }

  // -----------------------------------------------------------
  // TESTE 3: Criação de Logs de Auditoria (Admin Audit Trail)
  // -----------------------------------------------------------
  console.log('\n--- TESTE 3: Trilha de Auditoria Administrativa (admin_audit_logs) ---');
  {
    localStorage.clear();
    const adminId = 'usr-admin-01';

    // Grava log
    await AdminDataService.logAudit(
      adminId,
      'BLOCK_USER',
      'USER',
      'usr-target-01',
      { reason: 'Violação de termos', token: 'sensivel-deve-sumir', password: '123' }
    );

    const logsRes = await AdminDataService.getAuditLogs({ page: 1, limit: 10 });
    assert(logsRes.total >= 1, 'Audit log gravado com sucesso');
    const firstLog = logsRes.items[0];
    assert(firstLog.action === 'BLOCK_USER', 'Ação do audit log confere');
    assert(firstLog.adminUserId === adminId, 'ID do admin registrado corretamente');
    assert(firstLog.metadata?.password === undefined, 'Senhas e credenciais foram expurgadas do log');
    assert(firstLog.metadata?.token === undefined, 'Tokens foram expurgados do log');
    assert(firstLog.metadata?.reason === 'Violação de termos', 'Metadado legítimo preservado');

    // Filtro por ação
    const filteredRes = await AdminDataService.getAuditLogs({ page: 1, limit: 10, actionFilter: 'BLOCK_USER' });
    assert(filteredRes.items.length >= 1, 'Filtro por tipo de ação funciona na auditoria');
  }

  // -----------------------------------------------------------
  // TESTE 4: KPIs em Tempo Real do Dashboard
  // -----------------------------------------------------------
  console.log('\n--- TESTE 4: KPIs Reais do Dashboard Administrativo ---');
  {
    // Mock de dados locais para testar agregações
    localStorage.setItem('babysleep_user_profile', JSON.stringify({ id: 'usr-1', fullName: 'Mãe Teste' }));
    localStorage.setItem('babysleep_babies_list', JSON.stringify([
      { id: 'b-1', name: 'Bebê 1', birthDate: '2026-01-15' }, 
      { id: 'b-2', name: 'Bebê 2', birthDate: '2026-02-20' }
    ]));
    localStorage.setItem('babysleep_records', JSON.stringify([{ id: 's-1' }, { id: 's-2' }, { id: 's-3' }]));

    const kpis = await AdminDataService.getKPIs();
    assert(kpis.totalUsers >= 1, 'KPI total de usuários calculado');
    assert(kpis.totalBabies >= 2, 'KPI total de bebês calculado');
    assert(kpis.totalSleepRecords >= 3, 'KPI total de sono calculado');
    assert(typeof kpis.newUsersToday === 'number', 'KPI novos usuários hoje calculado');
    assert(typeof kpis.newUsersLast7Days === 'number', 'KPI novos usuários últimos 7 dias calculado');
    assert(typeof kpis.newUsersLast30Days === 'number', 'KPI novos usuários últimos 30 dias calculado');
    assert(Array.isArray(kpis.recentAuditLogs), 'KPI lista logs recentes da auditoria');
  }

  // -----------------------------------------------------------
  // TESTE 5: Gestão Paginada de Usuários, Busca e Filtros
  // -----------------------------------------------------------
  console.log('\n--- TESTE 5: Gestão de Usuários (Paginação, Filtros e Detalhes) ---');
  {
    const usersRes = await AdminDataService.getUsers({ page: 1, limit: 10 });
    assert(usersRes.items.length >= 1, 'getUsers retorna lista de usuários');
    assert(usersRes.total >= 1, 'getUsers retorna contagem total de registros');

    const firstUser = usersRes.items[0];
    assert(typeof firstUser.fullName === 'string', 'Usuário possui nome completo');
    assert(typeof firstUser.plan === 'string', 'Usuário possui identificação de plano');
    assert(typeof firstUser.babiesCount === 'number', 'Usuário contabiliza bebês vinculados');

    // Detalhes do Usuário (/admin/users/:id)
    const detail = await AdminDataService.getUserDetail(firstUser.id);
    assert(detail !== null, 'getUserDetail retorna detalhes completos');
    if (detail) {
      assert(Array.isArray(detail.babies), 'Detalhe inclui lista de bebês vinculados');
      assert(typeof detail.usageStats?.sleepRecordsCount === 'number', 'Detalhe inclui contagem de sono');
      assert(typeof detail.usageStats?.feedingRecordsCount === 'number', 'Detalhe inclui contagem de alimentação');
    }

    // Bloqueio de Usuário
    const blockRes = await AdminDataService.blockUser('usr-admin-01', firstUser.id, true);
    assert(blockRes === true, 'blockUser bloqueia usuário');
    const blockedList = await AdminDataService.getUsers({ page: 1, limit: 10 });
    const targetAfter = blockedList.items.find(u => u.id === firstUser.id);
    assert(targetAfter?.isBlocked === true, 'Status isBlocked reflete na listagem');

    // Desbloqueio
    await AdminDataService.blockUser('usr-admin-01', firstUser.id, false);
    const unblockedList = await AdminDataService.getUsers({ page: 1, limit: 10 });
    const targetUnblocked = unblockedList.items.find(u => u.id === firstUser.id);
    assert(targetUnblocked?.isBlocked === false, 'Desbloqueio atualiza status do usuário');
  }

  // -----------------------------------------------------------
  // TESTE 6: Gestão de Bebês com Mínimo Acesso
  // -----------------------------------------------------------
  console.log('\n--- TESTE 6: Listagem de Bebês com Princípio de Mínimo Acesso ---');
  {
    const babiesRes = await AdminDataService.getBabies({ page: 1, limit: 10 });
    assert(babiesRes.items.length >= 1, 'getBabies retorna listagem');
    assert(babiesRes.total >= 1, 'getBabies retorna total');
    const b = babiesRes.items[0];
    assert(typeof b.name === 'string', 'Bebê possui nome');
    assert(typeof b.birthDate === 'string', 'Bebê possui data de nascimento');
    assert(typeof b.ownerName === 'string', 'Bebê possui responsável associado');
    assert(typeof b.caregiversCount === 'number', 'Bebê possui contagem de cuidadores');
  }

  // -----------------------------------------------------------
  // TESTE 7: Gestão de Assinaturas e Modo Sandbox
  // -----------------------------------------------------------
  console.log('\n--- TESTE 7: Assinaturas e Identificação Explícita de Sandbox ---');
  {
    const subsRes = await AdminDataService.getSubscriptions({ page: 1, limit: 10 });
    assert(subsRes.items.length >= 1, 'getSubscriptions lista assinaturas');
    assert(subsRes.items[0].isSandbox === true, 'Assinaturas marcam isSandbox=true explicitamente');
    assert(typeof subsRes.kpis.totalFree === 'number', 'KPI de total FREE calculado');
    assert(typeof subsRes.kpis.totalPremium === 'number', 'KPI de total Premium calculado');
  }

  // -----------------------------------------------------------
  // TESTE 8: Conteúdo Educacional e Sons Procedurais
  // -----------------------------------------------------------
  console.log('\n--- TESTE 8: Moderação de Conteúdo e Catálogo de Sons ---');
  {
    // Conteúdo
    const content = AdminDataService.getContentList();
    assert(content.length >= 4, 'getContentList retorna cursos e artigos');
    const firstContent = content[0];
    assert(firstContent.status === 'PUBLISHED', 'Conteúdo inicia publicado');

    // Despublicar
    await AdminDataService.toggleContentPublish('admin-01', firstContent.id, 'PUBLISHED');
    const afterUnpublish = AdminDataService.getContentList().find(c => c.id === firstContent.id);
    assert(afterUnpublish?.status === 'DRAFT', 'Conteúdo alterado para status DRAFT');

    // Sons
    const sounds = AdminDataService.getSoundsList();
    assert(sounds.length === 12, 'getSoundsList retorna todos os 12 sons procedurais');
    const firstSound = sounds[0];
    assert(firstSound.isActive === true, 'Som inicia ativo');

    // Desativar som
    await AdminDataService.toggleSoundActive('admin-01', firstSound.id, false);
    const afterToggleSound = AdminDataService.getSoundsList().find(s => s.id === firstSound.id);
    assert(afterToggleSound?.isActive === false, 'Som procedural alterado para inativo');
  }

  // -----------------------------------------------------------
  // TESTE 9: Relatórios Analíticos com Período Dinâmico
  // -----------------------------------------------------------
  console.log('\n--- TESTE 9: Relatórios com Períodos (7, 14, 30, 90 dias) ---');
  {
    const report7 = await AdminDataService.getReportData(7);
    assert(Array.isArray(report7.growthData), 'Relatório 7 dias possui dados de crescimento');
    assert(Array.isArray(report7.sleepData), 'Relatório possui dados de sono');
    assert(Array.isArray(report7.routineData), 'Relatório possui dados de rotina');

    const report30 = await AdminDataService.getReportData(30);
    assert(report30.growthData.length >= 7, 'Relatório 30 dias gera pontos temporais');
  }

  // -----------------------------------------------------------
  // TESTE 10: Configurações Globais do Sistema
  // -----------------------------------------------------------
  console.log('\n--- TESTE 10: Configurações do Sistema e Algoritmo ---');
  {
    const settings = await AdminDataService.getSystemSettings();
    assert(settings.app_info?.name === 'BabySleep', 'Configurações trazem app_info');
    assert(typeof settings.prediction_engine?.weight_history === 'number', 'Configurações trazem pesos do algoritmo preditivo');
    assert(settings.subscription_sandbox?.sandbox_mode === true, 'Configurações confirmam sandbox_mode');

    // Atualizar
    await AdminDataService.updateSystemSetting('admin-01', 'prediction_engine', {
      weight_history: 0.45,
      weight_last_nap: 0.30,
      weight_night_sleep: 0.25,
      tolerance_minutes: 15,
    });
    const updatedSettings = await AdminDataService.getSystemSettings();
    assert(updatedSettings.prediction_engine?.weight_history === 0.45, 'updateSystemSetting atualiza parâmetros do algoritmo');
  }

  // -----------------------------------------------------------
  // TESTE 11: Integridade Arquitetural da Fase 8
  // -----------------------------------------------------------
  console.log('\n--- TESTE 11: Integridade Arquitetural da Fase 8 ---');
  {
    const filesToCheck = [
      'supabase/migrations/20261003_phase8_admin.sql',
      'src/types/admin.ts',
      'src/services/adminDataService.ts',
      'src/features/admin/AdminRoute.tsx',
      'src/features/admin/AdminLayout.tsx',
      'src/features/admin/AdminView.tsx',
      'src/features/admin/pages/AdminDashboardPage.tsx',
      'src/features/admin/pages/AdminUsersPage.tsx',
      'src/features/admin/pages/AdminBabiesPage.tsx',
      'src/features/admin/pages/AdminSubscriptionsPage.tsx',
      'src/features/admin/pages/AdminContentPage.tsx',
      'src/features/admin/pages/AdminSoundsPage.tsx',
      'src/features/admin/pages/AdminReportsPage.tsx',
      'src/features/admin/pages/AdminAuditPage.tsx',
      'src/features/admin/pages/AdminSettingsPage.tsx',
      'src/App.tsx'
    ];

    filesToCheck.forEach(relPath => {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert(fs.existsSync(fullPath), `Arquivo essencial da Fase 8 existe: ${relPath}`);
    });

    // Validar AdminRoute e AdminView integrados no App.tsx
    const appContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
    assert(appContent.includes('AdminView'), 'App.tsx inclui import dinâmico de AdminView');
    assert(appContent.includes('isAdminRoute'), 'App.tsx gerencia rota administrativa /admin');

    // Validar migration SQL
    const sqlContent = fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations/20261003_phase8_admin.sql'), 'utf-8');
    assert(sqlContent.includes('admin_audit_logs'), 'Migration cria tabela admin_audit_logs');
    assert(sqlContent.includes('admin_system_settings'), 'Migration cria tabela admin_system_settings');
    assert(sqlContent.includes('is_admin()'), 'Migration define função is_admin()');
    assert(sqlContent.includes('ROW LEVEL SECURITY'), 'Migration ativa RLS nas tabelas administrativas');
  }

  // -----------------------------------------------------------
  // RELATÓRIO FINAL DA BATERIA
  // -----------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  RESULTADO FASE 8: ${passedTests}/${totalTests} testes aprovados`);
  if (failedTests === 0) {
    console.log('  🎉 TODOS OS TESTES DA FASE 8 PASSARAM COM SUCESSO!');
  } else {
    console.error(`  ⚠️ ${failedTests} testes falharam.`);
    failureDetails.forEach(f => console.error(f));
    process.exit(1);
  }
  console.log('======================================================\n');
})();
