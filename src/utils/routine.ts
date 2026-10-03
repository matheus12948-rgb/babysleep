/**
 * Utilitários para rotina infantil, conversões e formatação
 */

export function celsiusToFahrenheit(celsius: number): number {
  return Number(((celsius * 9) / 5 + 32).toFixed(1));
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return Number((((fahrenheit - 32) * 5) / 9).toFixed(1));
}

export function formatTemperature(value: number, unit: 'C' | 'F' = 'C'): string {
  if (isNaN(value)) return '--';
  return `${value.toFixed(1)}°${unit}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatBreastfeedingSummary(leftMins: number = 0, rightMins: number = 0): string {
  const total = leftMins + rightMins;
  if (total === 0) return '0 min';
  if (leftMins > 0 && rightMins > 0) {
    return `E: ${leftMins}m • D: ${rightMins}m (${total} min total)`;
  }
  if (leftMins > 0) {
    return `Esquerdo: ${leftMins} min`;
  }
  return `Direito: ${rightMins} min`;
}

export const PRESET_BOTTLE_AMOUNTS = [30, 60, 90, 120, 150, 180, 200, 250];
export const BOTTLE_PRESET_AMOUNTS = PRESET_BOTTLE_AMOUNTS;

export const MEDICINE_DISCLAIMER = 
  "Este recurso serve apenas para registrar informações fornecidas pelo cuidador. Para orientações sobre medicamentos, consulte um profissional de saúde.";

export function validateBottleAmount(amount: number): { valid: boolean; isValid: boolean; warning?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, isValid: false, warning: 'Informe um volume válido maior que zero.' };
  }
  if (amount > 400) {
    return { valid: true, isValid: true, warning: 'Volume acima de 400ml informado. Verifique se o valor está correto.' };
  }
  return { valid: true, isValid: true };
}

export function validateTemperature(value: number, unit: 'C' | 'F' = 'C'): { valid: boolean; isValid: boolean; warning?: string } {
  if (isNaN(value)) {
    return { valid: false, isValid: false, warning: 'Informe um valor numérico de temperatura.' };
  }
  const celsiusValue = unit === 'F' ? fahrenheitToCelsius(value) : value;

  if (celsiusValue < 34 || celsiusValue > 43) {
    return { valid: true, isValid: true, warning: 'Valor de temperatura incomum informado. Verifique a medição do termômetro.' };
  }
  return { valid: true, isValid: true };
}
