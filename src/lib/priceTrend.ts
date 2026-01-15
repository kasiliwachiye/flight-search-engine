import type { FlightOffer } from "@/domain/types";

export type TrendDatum = {
  date: string;
  label: string;
  outbound?: number;
  return?: number;
};

const windowDays = 3;

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 997;
  }
  return hash;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatLabel(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function buildWindow(dateString: string): string[] {
  const base = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(base.getTime())) {
    return [];
  }

  const dates: string[] = [];
  for (let offset = -windowDays; offset <= windowDays; offset += 1) {
    dates.push(toDateString(addDays(base, offset)));
  }
  return dates;
}

function computeSeries(
  dates: string[],
  basePrice: number,
  varianceSeed: string
): Record<string, number> {
  const centerIndex = Math.floor(dates.length / 2);
  const spread = Math.max(25, basePrice * 0.12);

  const series: Record<string, number> = {};
  dates.forEach((date, index) => {
    const distance = Math.abs(index - centerIndex);
    const variance = (hashSeed(`${date}-${varianceSeed}`) % 9 - 4) / 100;
    const trend = basePrice + spread * (distance / Math.max(1, centerIndex));
    series[date] = Math.round(trend * (1 + variance));
  });

  return series;
}

export function buildPriceTrend(
  offers: FlightOffer[],
  departDate: string,
  returnDate?: string
): TrendDatum[] {
  if (!departDate || offers.length === 0) {
    return [];
  }

  const prices = offers.map((offer) => offer.price.total);
  const minPrice = Math.min(...prices);
  const baseOutbound = returnDate ? minPrice * 0.55 : minPrice;
  const baseReturn = returnDate ? minPrice * 0.45 : minPrice;

  const outboundDates = buildWindow(departDate);
  const outboundSeries = computeSeries(outboundDates, baseOutbound, "outbound");

  const returnDates = returnDate ? buildWindow(returnDate) : [];
  const returnSeries = returnDate
    ? computeSeries(returnDates, baseReturn, "return")
    : {};

  const dateSet = new Set([...outboundDates, ...returnDates]);
  const allDates = Array.from(dateSet).sort();

  return allDates.map((date) => ({
    date,
    label: formatLabel(date),
    outbound: outboundSeries[date],
    return: returnSeries[date],
  }));
}

