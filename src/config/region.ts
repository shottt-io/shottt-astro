export const TOTAL_FREE = import.meta.env.PUBLIC_TOTAL_FREE === 'true';
export const DEFAULT_LOCALE = (import.meta.env.PUBLIC_DEFAULT_LOCALE || 'fa') as 'fa' | 'en' | 'tr';
export const SITE_URL = import.meta.env.PUBLIC_SITE_URL || '';
export const CDN_STRATEGY = import.meta.env.CDN_STRATEGY || 'none';
export const SUPPORTED_CURRENCIES = (import.meta.env.PUBLIC_SUPPORTED_CURRENCIES || '$,€').split(',').map(c => c.trim());
export const IS_IRAN_SERVER = import.meta.env.PUBLIC_IS_IRAN_SERVER === 'true';
