export function parseNumericPrice(priceStr: string | number | undefined): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  // strip all characters except digits and decimal point
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatIndianCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatRupeePrice(priceStr: string | number | undefined, defaultAmount: number = 0): string {
  if (priceStr === undefined || priceStr === null || priceStr === '') {
    return formatIndianCurrency(defaultAmount);
  }
  if (typeof priceStr === 'number') {
    return formatIndianCurrency(priceStr);
  }
  const str = priceStr.trim();
  const num = parseNumericPrice(str);
  if (num > 0) {
    return formatIndianCurrency(num);
  }
  return formatIndianCurrency(defaultAmount);
}
