export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

export function formatStops(stops: number): string {
  if (stops <= 0) {
    return "Nonstop";
  }
  if (stops === 1) {
    return "1 stop";
  }
  return `${stops} stops`;
}

