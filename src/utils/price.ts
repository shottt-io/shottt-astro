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

/**
 * Formats a numeric price and appends/prepends the localized currency symbol.
 * E.g., "1450" (fa) -> "1,450 تومان"
 * E.g., "1450" (tr) -> "1,450 TL"
 * E.g., "10" (en) -> "$10"
 */
export function formatPriceWithUnit(
  price: string | number | null | undefined,
  currentLocale?: string
): string {
  const formatted = formatPrice(price);
  if (!formatted) return '';

  const locale = getLocale(currentLocale);
  const currency = translations[locale].currency;

  if (locale === 'en') {
    return `${currency}${formatted}`;
  }
  return `${formatted} ${currency}`;
}
