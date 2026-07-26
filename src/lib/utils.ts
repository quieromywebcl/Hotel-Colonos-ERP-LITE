/**
 * Chilean Pesos Formatter
 * Format numbers as $100.000 or $100.000 CLP
 */
export function formatCLP(amount: number): string {
  const rounded = Math.round(amount || 0);
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Format date string to Spanish readable format (e.g., 26 de Jul, 2026)
 */
export function formatDateES(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Calculate difference in days between two ISO dates
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Normalize and clean Chilean RUT format (12.345.678-9)
 */
export function formatRUT(rut: string): string {
  if (!rut) return '';
  const cleaned = rut.replace(/[^0-9kK]/g, '');
  if (cleaned.length < 2) return cleaned.toUpperCase();
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();
  
  let formattedBody = '';
  for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
    formattedBody = body.charAt(i) + formattedBody;
    if (j % 3 === 0 && i !== 0) {
      formattedBody = '.' + formattedBody;
    }
  }
  return `${formattedBody}-${dv}`;
}

/**
 * Whitelist de Correos Autorizados
 */
export const REQUIRED_ADMIN_EMAIL = 'hotelcolonos.la@gmail.com';

export const DEFAULT_AUTHORIZED_EMAILS = [
  'hotelcolonos.la@gmail.com',
  'emiliogalaz09@gmail.com',
  'quieromyweb.cl@gmail.com',
];

const WHITELIST_STORAGE_KEY = 'hotelcolonos_authorized_emails_v1';

export function getAuthorizedEmailsList(): string[] {
  try {
    const raw = localStorage.getItem(WHITELIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return Array.from(new Set([...DEFAULT_AUTHORIZED_EMAILS, ...parsed]));
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_AUTHORIZED_EMAILS;
}

export function addAuthorizedEmail(email: string): string[] {
  const current = getAuthorizedEmailsList();
  const normalized = email.trim().toLowerCase();
  if (!normalized || current.includes(normalized)) return current;

  const updated = [...current, normalized];
  try {
    localStorage.setItem(WHITELIST_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error al guardar whitelist:', e);
  }
  return updated;
}

export function removeAuthorizedEmail(email: string): string[] {
  const current = getAuthorizedEmailsList();
  const normalized = email.trim().toLowerCase();
  if (normalized === REQUIRED_ADMIN_EMAIL.toLowerCase()) return current;

  const updated = current.filter((e) => e.toLowerCase() !== normalized);
  try {
    localStorage.setItem(WHITELIST_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error al guardar whitelist:', e);
  }
  return updated;
}

export function isAuthorizedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const target = email.trim().toLowerCase();
  const list = getAuthorizedEmailsList();
  return list.some((e) => e.toLowerCase() === target);
}
