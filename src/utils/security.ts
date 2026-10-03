/**
 * BabySleep - Módulo de Segurança, Sanitização de Inputs e Prevenção de XSS
 */

/**
 * Escapa caracteres HTML potencialmente perigosos para evitar Cross-Site Scripting (XSS)
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza strings de entrada do usuário (notas de rotina, diário, nomes),
 * removendo tags HTML executáveis, esquemas javascript: e sequências maliciosas.
 */
export function sanitizeInput(input: string, maxLength: number = 2000): string {
  if (!input || typeof input !== 'string') return '';

  // 1. Remove tags script, style e iframes
  let clean = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // 2. Remove handlers de eventos in-line perigosos (ex: onerror=, onclick=)
  clean = clean.replace(/on\w+\s*=\s*(['"]).*?\1/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^>\s]+/gi, '');

  // 3. Remove esquemas de URL perigosos (javascript:, vbscript:, data:)
  clean = clean.replace(/(javascript|vbscript|data):/gi, '');

  // 4. Trunca para o tamanho máximo permitido
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  return clean.trim();
}

/**
 * Valida se um nome de bebê ou cuidador é seguro e adequado
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 60;
}

/**
 * Executa a limpeza segura de dados de sessão e cache local ao realizar Sign Out
 */
export function secureSignOutCleanup(): void {
  if (typeof localStorage === 'undefined') return;

  const preservedKeys = [
    'babysleep_theme', // Preserva tema claro/escuro preferido do dispositivo
    'babysleep_sound_volume', // Preserva volume ajustado do reprodutor
    'babysleep_sound_fadeout',
    'babysleep_pwa_install_dismissed'
  ];

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !preservedKeys.includes(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Erro durante limpeza de sessão:', e);
  }
}
