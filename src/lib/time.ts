export function parseIsoDurationToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) {
    return 0;
  }

  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);

  return hours * 60 + minutes;
}

export function formatDuration(minutes: number): string {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, minutes) : 0;
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

export function formatTime(isoDate: string, locale = "en-US"): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(isoDate: string, locale = "en-US"): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

