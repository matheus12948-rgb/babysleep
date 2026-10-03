import React, { useState, useEffect } from 'react';
import { X, FileText, Copy, Printer, Check, Calendar, Baby, AlertCircle } from 'lucide-react';
import { DataService } from '@/services/dataService';
import { PediatricReportData } from '@/types/subscription';

interface PediatricReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string;
}

export const PediatricReportModal: React.FC<PediatricReportModalProps> = ({
  isOpen,
  onClose,
  babyId,
}) => {
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [report, setReport] = useState<PediatricReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !babyId) return;

    let isMounted = true;
    setLoading(true);

    DataService.generatePediatricReport(babyId, periodDays)
      .then((data) => {
        if (isMounted) {
          setReport(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Erro ao gerar relatório pediátrico:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, babyId, periodDays]);

  if (!isOpen) return null;

  const copyAsText = () => {
    if (!report) return;

    const text = `📋 RELATÓRIO DE ROTINA PEDIÁTRICA — BABYSLEEP
Bebê: ${report.babyName}
Período: ${report.startDate} a ${report.endDate} (${report.periodDays} dias)
Responsável: ${report.caregiverName}
Gerado em: ${report.generatedAt}

🌙 PADRÃO DE SONO:
- Média de sono diário total: ${report.averageSleepHoursPerDay}h/dia
- Quantidade média de sonecas: ${report.averageNapsPerDay} sonecas/dia
- Duração média por soneca: ${report.averageNapDurationMinutes} minutos
- Média do sono noturno: ${report.averageNightSleepDurationHours}h
- Despertares noturnos médios: ${report.nightAwakeningsAverage} por noite

🍼 ALIMENTAÇÃO:
- Total de mamadas/refeições: ${report.totalFeedings} (média de ${report.feedingsPerDayAverage}/dia)
- Tempo total em amamentação: ${report.breastfeedingTotalMinutes} minutos
- Total em mamadeiras: ${report.bottleTotalMl} mL
- Refeições sólidas registradas: ${report.solidMealsCount}

🧷 FRALDAS:
- Média de fraldas de xixi/dia: ${report.wetDiapersPerDayAverage}
- Média de fraldas de cocô/dia: ${report.dirtyDiapersPerDayAverage}

Observações dos cuidadores:
${report.caregiverNotesSummary.length > 0 ? report.caregiverNotesSummary.map(n => `- ${n}`).join('\n') : '- Nenhuma intercorrência relevante registrada no período.'}

*Relatório descritivo baseado nos dados preenchidos pela família. Não substitui consulta médica pediátrica.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 flex flex-col my-auto max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Relatório para o Pediatra
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consolidado clínico de sono, alimentação e rotina
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Seletor de Período */}
        <div className="pt-3 pb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Período analisado:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setPeriodDays(d)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  periodDays === d
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Últimos {d} dias
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo do Relatório */}
        <div className="overflow-y-auto space-y-4 py-2 text-xs text-slate-700 dark:text-slate-200">
          {loading || !report ? (
            <div className="py-12 text-center text-slate-400">
              Calculando consolidados clínicos...
            </div>
          ) : (
            <>
              {/* Identificação */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Bebê</span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{report.babyName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Intervalo</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{report.startDate} até {report.endDate}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Emissão</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{report.generatedAt}</p>
                </div>
              </div>

              {/* Seção 1: Sono */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
                  🌙 Sono & Sonecas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400">Média Sono/Dia</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.averageSleepHoursPerDay}h</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400">Sonecas/Dia</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.averageNapsPerDay}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400">Média Soneca</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.averageNapDurationMinutes}m</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400">Despertares Noturnos</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.nightAwakeningsAverage}/noite</p>
                  </div>
                </div>
              </div>

              {/* Seção 2: Alimentação */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
                  🍼 Alimentação
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400">Total Mamadas/Refeições</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.totalFeedings}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400">Média Diária</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.feedingsPerDayAverage}/dia</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400">Tempo Amamentação</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.breastfeedingTotalMinutes} min</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400">Mamadeiras (Total)</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.bottleTotalMl} mL</p>
                  </div>
                </div>
              </div>

              {/* Seção 3: Fraldas */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
                  🧷 Eliminações / Fraldas
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
                    <span className="text-slate-500">Média de Fraldas com Xixi:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{report.wetDiapersPerDayAverage} / dia</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
                    <span className="text-slate-500">Média de Fraldas com Cocô:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{report.dirtyDiapersPerDayAverage} / dia</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Aviso:</strong> Este relatório é gerado automaticamente a partir dos apontamentos voluntários dos cuidadores. Destina-se ao apoio da consulta pediátrica e não constitui laudo clínico.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={copyAsText}
            disabled={loading || !report}
            className="flex-1 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado para a área de transferência!' : 'Copiar Texto para WhatsApp'}
          </button>

          <button
            onClick={handlePrint}
            disabled={loading || !report}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
          </button>
        </div>
      </div>
    </div>
  );
};
