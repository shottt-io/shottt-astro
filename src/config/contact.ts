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

export const CONTACT_EMAIL = getEnv('PUBLIC_CONTACT_EMAIL') || 'shottt.io.2026@gmail.com';
export const SUPPORT_TELEGRAM = getEnv('PUBLIC_INFO_CHANNEL_URL') || getEnv('INFO_CHANNEL_URL') || '';
