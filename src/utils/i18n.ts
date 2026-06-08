import { DEFAULT_LOCALE } from '../config/region';

export const translations = {
  fa: {
    seoTitle: "شات | پلتفرم کاتالوگ دیجیتال و منوی آنلاین",
    seoDescription: "پلتفرم مستقل، رایگان و متمرکز بر سرعت برای ساخت کاتالوگ و منوی دیجیتال مجموعه‌های ایرانی",
    confirm: "تایید",
    cancel: "انصراف",
    warning: "هشدار",
    gotIt: "متوجه شدم",
    developedWith: "توسعه پیدا کرده با",
    outOfStock: "ناموجود",
    digitalCatalog: "کاتالوگ دیجیتال",
    currency: "تومان",
  },
  en: {
    seoTitle: "Shottt | Digital Catalog and Online Menu Platform",
    seoDescription: "Independent, free and speed-focused platform to build digital catalogs and menus",
    confirm: "Confirm",
    cancel: "Cancel",
    warning: "Warning",
    gotIt: "Got it",
    developedWith: "Powered by",
    outOfStock: "Out of Stock",
    digitalCatalog: "Digital Catalog",
    currency: "$",
  },
  tr: {
    seoTitle: "Shottt | Dijital Katalog ve Çevrimiçi Menü Platformu",
    seoDescription: "İşletmeler için dijital kataloglar ve menüler oluşturmak için bağımsız, ücretsiz ve hızlı odaklı platform",
    confirm: "Onayla",
    cancel: "İptal",
    warning: "Uyarı",
    gotIt: "Anladım",
    developedWith: "Tarafından geliştirildi",
    outOfStock: "Tükendi",
    digitalCatalog: "Dijital Katalog",
    currency: "TL",
  }
};

export type Locale = 'fa' | 'en' | 'tr';

export function getLocale(cookies: any, request?: Request): Locale {
  // 1. Check Cookie
  let cookieLang: string | undefined;
  if (cookies && typeof cookies.get === 'function') {
    cookieLang = cookies.get('lang')?.value;
  }
  
  if (cookieLang === 'en' || cookieLang === 'tr' || cookieLang === 'fa') {
    return cookieLang as Locale;
  }

  // 2. Check Accept-Language Header (Browser Language)
  if (request && request.headers) {
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
      const langLower = acceptLang.toLowerCase();
      if (langLower.startsWith('tr')) return 'tr';
      if (langLower.startsWith('fa') || langLower.startsWith('ir')) return 'fa';
    }
  }

  // 3. Fall back to configuration default locale
  return DEFAULT_LOCALE;
}

export function useTranslations(cookies: any, request?: Request) {
  const locale = getLocale(cookies, request);
  return {
    t: (key: keyof typeof translations['en']) => {
      return translations[locale][key] || translations['en'][key];
    },
    locale,
    dir: locale === 'fa' ? 'rtl' : 'ltr',
  };
}
