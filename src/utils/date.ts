import { 
  differenceInDays, 
  differenceInWeeks, 
  differenceInMonths, 
  differenceInMinutes, 
  format, 
  parseISO, 
  isValid,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface BabyAge {
  days: number;
  weeks: number;
  months: number;
  formatted: string;
}

export function calculateBabyAge(birthDateString: string): BabyAge {
  if (!birthDateString) {
    return { days: 0, weeks: 0, months: 0, formatted: 'Idade não informada' };
  }

  // Interpreta data local considerando componentes YYYY-MM-DD para evitar shift de timezone UTC
  const parts = birthDateString.split('-');
  let birthDate: Date;
  if (parts.length === 3) {
    birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  } else {
    birthDate = parseISO(birthDateString);
  }

  if (!isValid(birthDate)) {
    return { days: 0, weeks: 0, months: 0, formatted: 'Data inválida' };
  }

  const today = startOfDay(new Date());
  const birthDay = startOfDay(birthDate);

  const days = Math.max(0, differenceInDays(today, birthDay));
  const weeks = Math.max(0, differenceInWeeks(today, birthDay));
  const months = Math.max(0, differenceInMonths(today, birthDay));

  let formatted = '';
  if (months >= 1) {
    const remainingDays = days - months * 30; // Aproximação amigável
    if (remainingDays > 0) {
      formatted = `${months} ${months === 1 ? 'mês' : 'meses'} e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
    } else {
      formatted = `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
  } else if (weeks >= 1) {
    const remainingDays = days % 7;
    if (remainingDays > 0) {
      formatted = `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
    } else {
      formatted = `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }
  } else {
    formatted = `${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  return { days, weeks, months, formatted };
}

export function formatTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return '--:--';
    return format(date, 'HH:mm', { locale: ptBR });
  } catch {
    return '--:--';
  }
}

export function formatDateShort(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return '';
    return format(date, "d 'de' MMMM", { locale: ptBR });
  } catch {
    return '';
  }
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 0) return '0 min';
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);

  if (hours > 0) {
    return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
  }
  return `${remainingMins}min`;
}

export function getDurationInMinutes(startIso: string, endIso: string): number {
  try {
    const start = parseISO(startIso);
    const end = parseISO(endIso);
    if (!isValid(start) || !isValid(end)) return 0;
    return Math.max(0, differenceInMinutes(end, start));
  } catch {
    return 0;
  }
}
