function getEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key]!;
  }
  try {
    return (import.meta.env[key] as string) || '';
  } catch (e) {
    return '';
  }
}

export const TOTAL_FREE = getEnv('PUBLIC_TOTAL_FREE') === 'true';
export const DEFAULT_LOCALE = (getEnv('PUBLIC_DEFAULT_LOCALE') || 'fa') as 'fa' | 'en' | 'tr';
export const SITE_URL = getEnv('PUBLIC_SITE_URL') || '';
export const CDN_STRATEGY = getEnv('CDN_STRATEGY') || 'none';
export const SUPPORTED_CURRENCIES = (getEnv('PUBLIC_SUPPORTED_CURRENCIES') || '$,€').split(',').map(c => c.trim());
export const IS_IRAN_SERVER = getEnv('PUBLIC_IS_IRAN_SERVER') === 'true';
