import { AggregatedStats, PeriodComparison, TrendInsight } from './types';
import { formatDurationMinutes } from '@/utils/date';

export class TrendDetector {
  /**
   * Detecta padrões e tendências com base nas estatísticas agregadas e comparação de períodos.
   * Utiliza linguagem puramente descritiva e acolhedora, sem induzir causalidade ou diagnóstico.
   */
  public static detectTrends(stats: AggregatedStats, comparison: PeriodComparison): TrendInsight[] {
    const trends: TrendInsight[] = [];

    // Se houver dados insuficientes
    if (stats.readinessState === 'NO_DATA') {
      return [
        {
          id: 'trend-no-data',
          category: 'SLEEP',
          title: 'Início da Jornada',
          description: 'Registre os primeiros sonos do seu bebê para começarmos a identificar os ritmos naturais da rotina.',
          direction: 'NEUTRAL',
        },
      ];
    }

    // 1. Tendência do Sono Total
    const diffTotal = comparison.totalSleep.diffMinutes;
    if (Math.abs(diffTotal) >= 15) {
      if (diffTotal > 0) {
        trends.push({
          id: 'trend-total-sleep-up',
          category: 'SLEEP',
          title: 'Sono Total em Alta',
          description: `O bebê dormiu em média ${formatDurationMinutes(diffTotal)} a mais por dia em relação ao período anterior.`,
          direction: 'UP',
        });
      } else {
        trends.push({
          id: 'trend-total-sleep-down',
          category: 'SLEEP',
          title: 'Variação no Sono Total',
          description: `O tempo diário de sono apresentou uma redução média de ${formatDurationMinutes(Math.abs(diffTotal))} nos últimos dias.`,
          direction: 'DOWN',
        });
      }
    } else if (stats.totalSleep.average > 0) {
      trends.push({
        id: 'trend-total-sleep-stable',
        category: 'SLEEP',
        title: 'Sono Estável',
        description: `O tempo total de sono vem mantendo uma média diária consistente de ${formatDurationMinutes(stats.totalSleep.average)}.`,
        direction: 'NEUTRAL',
      });
    }

    // 2. Tendência do Sono Noturno
    const diffNight = comparison.nightSleep.diffMinutes;
    if (diffNight >= 20) {
      trends.push({
        id: 'trend-night-sleep-up',
        category: 'SLEEP',
        title: 'Consolidação Noturna',
        description: `O sono noturno aumentou em média ${formatDurationMinutes(diffNight)} esta semana.`,
        direction: 'UP',
      });
    }

    // 3. Tendência das Sonecas
    if (stats.naps.totalNaps >= 4) {
      const napSpread = stats.naps.maxDurationMinutes - stats.naps.minDurationMinutes;
      if (napSpread <= 30 && stats.naps.avgDurationMinutes > 0) {
        trends.push({
          id: 'trend-nap-uniformity',
          category: 'NAPS',
          title: 'Sonecas Regulares',
          description: `As sonecas estão apresentando durações próximas, com média de ${formatDurationMinutes(stats.naps.avgDurationMinutes)}.`,
          direction: 'NEUTRAL',
        });
      } else {
        trends.push({
          id: 'trend-nap-flexible',
          category: 'NAPS',
          title: 'Ritmo Dinâmico de Sonecas',
          description: `As sonecas variaram entre ${formatDurationMinutes(stats.naps.minDurationMinutes)} e ${formatDurationMinutes(stats.naps.maxDurationMinutes)} nos últimos dias.`,
          direction: 'NEUTRAL',
        });
      }
    }

    // 4. Tendência de Horário de Dormir
    if (stats.averageTimes.avgBedtime !== '--:--') {
      trends.push({
        id: 'trend-bedtime-anchor',
        category: 'BEDTIME',
        title: 'Janela Noturna Típica',
        description: `O início do sono noturno tem se concentrado habitualmente por volta das ${stats.averageTimes.avgBedtime}.`,
        direction: 'NEUTRAL',
      });
    }

    // 5. Tendência da Janela de Vigília
    if (stats.wakeWindow.avgMinutes > 0) {
      trends.push({
        id: 'trend-wake-window',
        category: 'WAKE_WINDOW',
        title: 'Tempo Médio Acordado',
        description: `A janela média de vigília observada foi de ${formatDurationMinutes(stats.wakeWindow.avgMinutes)}.`,
        direction: 'NEUTRAL',
      });
    }

    return trends;
  }
}
