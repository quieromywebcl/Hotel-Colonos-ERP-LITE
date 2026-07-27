import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Sanitize Supabase URL: ensure it NEVER ends in /rest/v1/ or trailing slashes
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let clean = rawUrl.trim();
  clean = clean.replace(/\/rest\/v1\/?$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const rawUrl = metaEnv.VITE_SUPABASE_URL || 'https://penzgxjvoymhdevkakzy.supabase.co';
const rawAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.VITE_SUBBASE_ANONYMOUS_KEY || 'sb_publishable_VeZckisBbjhXh5KzEds4ew_6CfOUtKe';

export const DEFAULT_SUPABASE_URL = sanitizeSupabaseUrl(rawUrl);
export const DEFAULT_SUPABASE_ANON_KEY = rawAnonKey;

// Backward-compatible exports
export const SUPABASE_URL = DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = DEFAULT_SUPABASE_ANON_KEY;

/**
 * Local Storage Keys
 */
export const LOCAL_STORAGE_KEYS = {
  ROOMS: 'hotelcolonos_rooms_v1',
  GUESTS: 'hotelcolonos_guests_v1',
  SALES: 'hotelcolonos_sales_v1',
  EXPENSES: 'hotelcolonos_expenses_v1',
  DEBTS: 'hotelcolonos_debts_v1',
  INVENTORY: 'hotelcolonos_inventory_v1',
  PROFIT_GOAL: 'hotelcolonos_profit_goal_v1',
  AUTH_USER: 'hotelcolonos_auth_user_v1',
  SUPABASE_CREDS: 'hotelcolonos_custom_supabase_creds_v1',
};

export interface CustomSupabaseCredentials {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseCreds(): CustomSupabaseCredentials | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SUPABASE_CREDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return {
          url: sanitizeSupabaseUrl(parsed.url),
          anonKey: parsed.anonKey,
        };
      }
    }
  } catch {
    // fallback
  }
  return null;
}

export function setStoredSupabaseCreds(creds: CustomSupabaseCredentials | null) {
  if (!creds) {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SUPABASE_CREDS);
  } else {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.SUPABASE_CREDS,
      JSON.stringify({
        url: sanitizeSupabaseUrl(creds.url),
        anonKey: creds.anonKey,
      })
    );
  }
  cachedClient = null; // Reset cached client on change
}

export function getActiveSupabaseCreds(): CustomSupabaseCredentials {
  const stored = getStoredSupabaseCreds();
  if (stored && stored.url && stored.anonKey) {
    return stored;
  }
  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
  };
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  const { url, anonKey } = getActiveSupabaseCreds();
  const cleanUrl = sanitizeSupabaseUrl(url);

  if (!cleanUrl || !anonKey) {
    return null;
  }
  try {
    cachedClient = createClient(cleanUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedClient;
  } catch (e) {
    console.warn('Error al crear cliente de Supabase:', e);
    return null;
  }
}

/**
 * Dynamic Supabase Client Proxy
 * Always resolves queries using the active Supabase client credentials.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      return () => Promise.resolve({ data: null, error: new Error('Supabase no configurado') });
    }
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

export const isSupabaseConfigured = true;



