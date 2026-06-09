import { translations, getLocale } from './i18n';

/**
 * Formats a numeric price string or number with standard English digits and thousand separators.
 * E.g., "1450" -> "1,450"
 */
export function formatPrice(price: string | number | null | undefined): string {
  if (price === null || price === undefined) return '';
  const priceStr = price.toString().trim();
  if (!priceStr) return '';

  const num = Number(priceStr);
  if (isNaN(num)) {
    // Fallback: If it's not a valid number, format English digits with comma separators
    return priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  return num.toLocaleString('en-US');
}

export function formatPriceWithUnit(
  price: string | number | null | undefined,
  currentLocale?: string,
  vendorCurrency?: string | null
): string {
  const formatted = formatPrice(price);
  if (!formatted) return '';

  const locale = getLocale(currentLocale);
  const currency = (vendorCurrency && vendorCurrency.trim())
    ? vendorCurrency.trim()
    : translations[locale].currency;

  const prefixSymbols = ['$', '€', '£', '¥', '₩', '₽', '₨', '元', '₪'];

  if (prefixSymbols.includes(currency)) {
    return `${currency}${formatted}`;
  }

  if (!vendorCurrency && locale === 'en') {
    return `${currency}${formatted}`;
  }

  return `${formatted} ${currency}`;
}
