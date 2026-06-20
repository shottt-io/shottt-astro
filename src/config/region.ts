function getEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key]!;
  }
  try {
    switch (key) {
      case 'PUBLIC_INFO_CHANNEL_URL':
        return (import.meta.env.PUBLIC_INFO_CHANNEL_URL as string) || '';
      case 'INFO_CHANNEL_URL':
        return (import.meta.env.INFO_CHANNEL_URL as string) || '';
      case 'PUBLIC_TOTAL_FREE':
        return (import.meta.env.PUBLIC_TOTAL_FREE as string) || '';
      case 'PUBLIC_FREE_LIMIT':
        return (import.meta.env.PUBLIC_FREE_LIMIT as string) || '';
      case 'PUBLIC_DEFAULT_LOCALE':
        return (import.meta.env.PUBLIC_DEFAULT_LOCALE as string) || '';
      case 'PUBLIC_SITE_URL':
        return (import.meta.env.PUBLIC_SITE_URL as string) || '';
      case 'CDN_STRATEGY':
        return (import.meta.env.CDN_STRATEGY as string) || '';
      case 'PUBLIC_SUPPORTED_CURRENCIES':
        return (import.meta.env.PUBLIC_SUPPORTED_CURRENCIES as string) || '';
      case 'PUBLIC_IS_IRAN_SERVER':
        return (import.meta.env.PUBLIC_IS_IRAN_SERVER as string) || '';

      case 'PUBLIC_SUBSCRIPTION_FEE':
        return (import.meta.env.PUBLIC_SUBSCRIPTION_FEE as string) || '';
      case 'PUBLIC_PAYMENT_URL':
        return (import.meta.env.PUBLIC_PAYMENT_URL as string) || '';
      case 'PUBLIC_PAYMENT_TYPE':
        return (import.meta.env.PUBLIC_PAYMENT_TYPE as string) || '';
      case 'PUBLIC_SALE_URL':
        return (import.meta.env.PUBLIC_SALE_URL as string) || '';
      default:
        return (import.meta.env[key] as string) || '';
    }
  } catch (e) {
    return '';
  }
}

export const TOTAL_FREE = getEnv('PUBLIC_TOTAL_FREE') === 'true';
export const FREE_LIMIT = parseInt(getEnv('PUBLIC_FREE_LIMIT') || '15', 10);
export const DEFAULT_LOCALE = (getEnv('PUBLIC_DEFAULT_LOCALE') || 'fa') as 'fa' | 'en' | 'tr';
export const SITE_URL = getEnv('PUBLIC_SITE_URL') || '';
export const CDN_STRATEGY = getEnv('CDN_STRATEGY') || 'none';
export const SUPPORTED_CURRENCIES = (getEnv('PUBLIC_SUPPORTED_CURRENCIES') || '$,€').split(',').map(c => c.trim());
export const IS_IRAN_SERVER = getEnv('PUBLIC_IS_IRAN_SERVER') === 'true';
export const INFO_CHANNEL_URL = getEnv('PUBLIC_INFO_CHANNEL_URL') || getEnv('INFO_CHANNEL_URL') || '';

export const SUBSCRIPTION_FEE = getEnv('PUBLIC_SUBSCRIPTION_FEE');
export const PAYMENT_URL = getEnv('PUBLIC_PAYMENT_URL') || '';
export const PAYMENT_TYPE = getEnv('PUBLIC_PAYMENT_TYPE') || '';
export const SALE_URL = getEnv('PUBLIC_SALE_URL') || getEnv('SALE_URL') || '';

