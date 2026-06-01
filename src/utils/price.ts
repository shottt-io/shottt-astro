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
 * Formats a numeric price and appends the "تومان" suffix.
 * E.g., "1450" -> "1,450 تومان"
 */
export function formatPriceWithUnit(price: string | number | null | undefined): string {
  const formatted = formatPrice(price);
  return formatted ? `${formatted} تومان` : '';
}
