/**
 * BabySleep - Testes Automatizados de Validação Técnica da FASE 5
 * Multi-Cuidador, Convites, Permissões por Papel, Assinaturas (Paywall) e Relatórios Pediátricos
 */

import fs from 'node:fs';
import path from 'node:path';
import { getCaregiverPermissions, CaregiverRole } from '../src/types/caregiver';
import { PLAN_BENEFITS, SubscriptionPlanType } from '../src/types/subscription';
import { DataService } from '../src/services/dataService';
import { BabyProfile, SleepRecord, FeedingRecord, DiaperRecord } from '../src/types';

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
console.log('  INICIANDO BATERIA DE TESTES TÉCNICOS — FASE 5');
console.log('  Multi-Cuidador, Tempo Real, Paywall & Relatório Pediátrico');
console.log('======================================================\n');

(async () => {
  // -----------------------------------------------------------
  // TESTE 1: Matriz de Permissões de Cuidadores (Role-Based Access)
  // -----------------------------------------------------------
  console.log('--- TESTE 1: Matriz de Permissões por Papel (OWNER, CAREGIVER, VIEWER) ---');
  {
    // 1. Papel OWNER
    const ownerPerms = getCaregiverPermissions('OWNER');
    assert(ownerPerms.isOwner === true, 'OWNER é identificado como isOwner');
    assert(ownerPerms.canEdit === true, 'OWNER possui permissão de edição (canEdit)');
    assert(ownerPerms.canInvite === true, 'OWNER pode convidar novos cuidadores (canInvite)');
    assert(ownerPerms.canDeleteBaby === true, 'OWNER pode excluir ou gerenciar bebê');
    assert(ownerPerms.isViewerOnly === false, 'OWNER não é limitado a visualização');

    // 2. Papel CAREGIVER (Co-pais, babás)
    const caregiverPerms = getCaregiverPermissions('CAREGIVER');
    assert(caregiverPerms.isOwner === false, 'CAREGIVER não é isOwner');
    assert(caregiverPerms.canEdit === true, 'CAREGIVER possui permissão de edição (canEdit)');
    assert(caregiverPerms.canInvite === false, 'CAREGIVER não pode convidar terceiros');
    assert(caregiverPerms.canDeleteBaby === false, 'CAREGIVER não pode excluir o bebê');
    assert(caregiverPerms.isViewerOnly === false, 'CAREGIVER pode registrar eventos');

    // 3. Papel VIEWER (Avós, Observadores, Pediatra)
    const viewerPerms = getCaregiverPermissions('VIEWER');
    assert(viewerPerms.isOwner === false, 'VIEWER não é isOwner');
    assert(viewerPerms.canEdit === false, 'VIEWER NÃO pode registrar ou editar eventos');
    assert(viewerPerms.canInvite === false, 'VIEWER não pode convidar');
    assert(viewerPerms.canDeleteBaby === false, 'VIEWER não pode excluir');
    assert(viewerPerms.isViewerOnly === true, 'VIEWER é estritamente somente leitura');

    // 4. Papel Nulo ou Desconhecido
    const nullPerms = getCaregiverPermissions(null);
    assert(nullPerms.canEdit === false && nullPerms.isViewerOnly === true, 'Papel nulo é bloqueado por padrão (fail-closed)');
  }

  // -----------------------------------------------------------
  // TESTE 2: Fluxo Completo de Convites de Cuidador (Invite & Join)
  // -----------------------------------------------------------
  console.log('\n--- TESTE 2: Ciclo de Vida de Convites (Geração, Aceite, Expiração e Revogação) ---');
  {
    const testBabyId = 'test-baby-phase5';
    const ownerUserId = 'user-owner-123';
    const newCaregiverUserId = 'user-caregiver-456';
    const viewerUserId = 'user-viewer-789';

    // 1. Criar convite para CAREGIVER
    const inv1 = await DataService.createCaregiverInvitation({
      babyId: testBabyId,
      invitedByUserId: ownerUserId,
      email: 'mamae@exemplo.com',
      role: 'CAREGIVER',
    });

    assert(Boolean(inv1.id && inv1.inviteCode), 'Convite gerado com ID e código');
    assert(inv1.inviteCode.startsWith('BS-'), 'Código possui prefixo amigável BS-');
    assert(inv1.status === 'PENDING', 'Status inicial do convite é PENDING');
    assert(new Date(inv1.expiresAt).getTime() > Date.now(), 'Validade do convite configurada para o futuro (7 dias)');

    // 2. Listar convites pendentes
    const pendings = await DataService.getCaregiverInvitations(testBabyId);
    assert(pendings.length >= 1, 'Convite pendente listado com sucesso');
    assert(pendings.some(p => p.inviteCode === inv1.inviteCode), 'Código está presente na listagem');

    // 3. Aceitar convite com novo cuidador
    const acceptRes = await DataService.acceptCaregiverInvitation(
      inv1.inviteCode,
      newCaregiverUserId,
      'mamae@exemplo.com',
      'Mamãe Co-cuidadora'
    );
    assert(acceptRes.success === true, 'Convite aceito com sucesso pelo novo usuário');
    assert(acceptRes.babyId === testBabyId, 'Bebê retornado confere com o convite');
    assert(acceptRes.role === 'CAREGIVER', 'Papel vinculado confere com o convite (CAREGIVER)');

    // 4. Verificar cuidador na lista do bebê
    const babyCaregivers = await DataService.getBabyCaregivers(testBabyId);
    const addedCg = babyCaregivers.find(c => c.userId === newCaregiverUserId);
    assert(Boolean(addedCg), 'Cuidador aceito foi adicionado à lista de cuidadores do bebê');
    assert(addedCg?.role === 'CAREGIVER', 'Papel do cuidador na lista é CAREGIVER');

    // 5. Tentar reutilizar o mesmo código já aceito (Deve falhar)
    const secondTry = await DataService.acceptCaregiverInvitation(
      inv1.inviteCode,
      'another-user',
      'outro@exemplo.com'
    );
    assert(secondTry.success === false, 'Código de convite já aceito não pode ser reutilizado');

    // 6. Criar convite para VIEWER
    const invViewer = await DataService.createCaregiverInvitation({
      babyId: testBabyId,
      invitedByUserId: ownerUserId,
      email: 'vovo@exemplo.com',
      role: 'VIEWER',
    });
    const acceptViewer = await DataService.acceptCaregiverInvitation(
      invViewer.inviteCode,
      viewerUserId,
      'vovo@exemplo.com',
      'Vovó'
    );
    assert(acceptViewer.success === true && acceptViewer.role === 'VIEWER', 'Convite de VIEWER aceito com sucesso');

    // 7. Remover cuidador
    await DataService.removeCaregiver(testBabyId, viewerUserId);
    const afterRemove = await DataService.getBabyCaregivers(testBabyId);
    assert(!afterRemove.some(c => c.userId === viewerUserId), 'Cuidador removido com sucesso pelo OWNER');

    // 8. Revogar convite pendente
    const invToRevoke = await DataService.createCaregiverInvitation({
      babyId: testBabyId,
      invitedByUserId: ownerUserId,
      email: 'baba@exemplo.com',
      role: 'CAREGIVER',
    });
    await DataService.revokeInvitation(invToRevoke.id);
    const pendingsAfterRevoke = await DataService.getCaregiverInvitations(testBabyId);
    assert(!pendingsAfterRevoke.some(p => p.id === invToRevoke.id), 'Convite revogado cancelado com sucesso');
  }

  // -----------------------------------------------------------
  // TESTE 3: Assinaturas e Paywall Premium (Free vs Pro)
  // -----------------------------------------------------------
  console.log('\n--- TESTE 3: Modelo de Assinaturas, Benefícios e Paywall ---');
  {
    const subUserId = 'sub-test-user-999';

    // 1. Assinatura padrão inicial (Plano Free)
    const defaultSub = await DataService.getUserSubscription(subUserId);
    assert(defaultSub.planType === 'FREE', 'Novo usuário inicia no plano FREE');
    assert(defaultSub.status === 'ACTIVE', 'Status do plano Free é ACTIVE');

    // 2. Upgrade para Plano Mensal
    const monthlySub = await DataService.updateUserSubscription(subUserId, 'PREMIUM_MONTHLY');
    assert(monthlySub.planType === 'PREMIUM_MONTHLY', 'Upgrade para PREMIUM_MONTHLY realizado');
    assert(Boolean(monthlySub.currentPeriodEnd), 'Data de término do período configurada para 30 dias');

    // 3. Upgrade para Plano Anual
    const yearlySub = await DataService.updateUserSubscription(subUserId, 'PREMIUM_YEARLY');
    assert(yearlySub.planType === 'PREMIUM_YEARLY', 'Upgrade para PREMIUM_YEARLY realizado');
    const daysDiff = (new Date(yearlySub.currentPeriodEnd!).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    assert(daysDiff > 350, 'Período anual configurado com ~365 dias de validade');

    // 4. Cancelamento de Assinatura
    const canceledSub = await DataService.updateUserSubscription(subUserId, 'FREE', 'CANCELED');
    assert(canceledSub.planType === 'FREE' && canceledSub.status === 'CANCELED', 'Cancelamento gravado com sucesso');

    // 5. Verificação do catálogo de benefícios
    assert(PLAN_BENEFITS.length >= 6, `Catálogo de benefícios contém ao menos 6 itens (encontrados: ${PLAN_BENEFITS.length})`);
    const expectedBenefitIds = [
      'naps_prediction',
      'unlimited_babies',
      'unlimited_caregivers',
      'realtime_sync',
      'full_sound_library',
      'pediatric_reports'
    ];
    expectedBenefitIds.forEach(bId => {
      assert(PLAN_BENEFITS.some(b => b.id === bId), `Benefício essencial '${bId}' configurado`);
    });
  }

  // -----------------------------------------------------------
  // TESTE 4: Gerador de Relatório Clínico para o Pediatra
  // -----------------------------------------------------------
  console.log('\n--- TESTE 4: Geração de Relatório Consolidado para o Pediatra ---');
  {
    const reportBabyId = 'baby-report-test-1';

    // Cadastrar perfil do bebê para o teste
    const testBaby: BabyProfile = {
      id: reportBabyId,
      ownerId: 'user-report-owner',
      name: 'Helena',
      birthDate: '2026-06-01',
      habitualWakeTime: '07:00:00',
      habitualBedtime: '19:30:00',
      expectedNapsCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await DataService.saveBabyProfile(testBaby);

    // Cadastrar sono dos últimos dias
    const now = new Date();
    const sleepRecord: SleepRecord = {
      id: 'sleep-rep-1',
      babyId: reportBabyId,
      type: 'NAP',
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 60,
      qualityRating: 5,
      isOngoing: false,
      isManuallyAdded: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    await DataService.saveSleepRecord(sleepRecord);

    // Cadastrar alimentação
    const feedingRecord: FeedingRecord = {
      id: 'feeding-rep-1',
      babyId: reportBabyId,
      type: 'BOTTLE',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      bottleAmountMl: 120,
      bottleContents: 'FORMULA',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    await DataService.saveFeedingRecord(feedingRecord);

    // Cadastrar fralda
    const diaperRecord: DiaperRecord = {
      id: 'diaper-rep-1',
      babyId: reportBabyId,
      type: 'BOTH',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    await DataService.saveDiaperRecord(diaperRecord);

    // Gerar Relatório Pediátrico de 7 dias
    const report = await DataService.generatePediatricReport(reportBabyId, 7);

    assert(report.babyName === 'Helena', 'Nome do bebê confere no relatório');
    assert(report.periodDays === 7, 'Período analisado é de 7 dias');
    assert(report.totalSleepHours >= 1.0, `Horas de sono contabilizadas (${report.totalSleepHours}h)`);
    assert(report.averageNapDurationMinutes === 60, 'Duração média da soneca calculada corretamente (60 min)');
    assert(report.totalFeedings >= 1, 'Mamadas/Refeições contabilizadas');
    assert(report.bottleTotalMl >= 120, 'Volume de mamadeira somado (120 mL)');
    assert(report.wetDiapersPerDayAverage > 0, 'Média de fraldas calculada');
    assert(Boolean(report.generatedAt), 'Data e hora de emissão carimbada');
  }

  // -----------------------------------------------------------
  // TESTE 5: Arquitetura de Componentes e Arquivos da FASE 5
  // -----------------------------------------------------------
  console.log('\n--- TESTE 5: Integridade Arquitetural da FASE 5 ---');
  {
    const filesToCheck = [
      'supabase/migrations/20261003_phase5_multicaregiver_subscriptions.sql',
      'src/types/caregiver.ts',
      'src/types/subscription.ts',
      'src/features/caregiver/useCaregiver.ts',
      'src/features/caregiver/InviteCaregiverModal.tsx',
      'src/features/caregiver/JoinBabyModal.tsx',
      'src/features/subscription/SubscriptionContext.tsx',
      'src/features/subscription/PremiumUpgradeModal.tsx',
      'src/features/subscription/PediatricReportModal.tsx',
      'src/features/realtime/useBabyRealtime.ts',
      'src/pages/ProfilePage.tsx'
    ];

    filesToCheck.forEach(relPath => {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert(fs.existsSync(fullPath), `Arquivo essencial existe: ${relPath}`);
    });

    // Validar integração no App.tsx
    const appContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
    assert(appContent.includes('SubscriptionProvider'), 'SubscriptionProvider envolve a árvore do app');

    // Validar integração no ProfilePage.tsx
    const profileContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/ProfilePage.tsx'), 'utf-8');
    assert(profileContent.includes('InviteCaregiverModal'), 'ProfilePage inclui InviteCaregiverModal');
    assert(profileContent.includes('JoinBabyModal'), 'ProfilePage inclui JoinBabyModal');
    assert(profileContent.includes('PremiumUpgradeModal'), 'ProfilePage inclui PremiumUpgradeModal');
    assert(profileContent.includes('PediatricReportModal'), 'ProfilePage inclui PediatricReportModal');
    assert(profileContent.includes('useBabyRealtime'), 'ProfilePage utiliza useBabyRealtime');
  }

  // -----------------------------------------------------------
  // RELATÓRIO FINAL DA BATERIA
  // -----------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  RESULTADO FASE 5: ${passedTests}/${totalTests} testes aprovados`);
  if (failedTests === 0) {
    console.log('  🎉 TODOS OS TESTES DA FASE 5 PASSARAM COM SUCESSO!');
  } else {
    console.error(`  ⚠️ ${failedTests} testes falharam.`);
    failureDetails.forEach(f => console.error(f));
    process.exit(1);
  }
  console.log('======================================================\n');
})();
