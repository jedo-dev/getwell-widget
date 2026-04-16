type TenantTimezone =
  | {
      name?: string | null;
      code?: string | null;
    }
  | null
  | undefined;

const OFFSET_RE = /([+-])\s*(\d{1,2})(?::?(\d{2}))?/;

const toUtcDate = (serverDateTime: string): Date | null => {
  if (!serverDateTime) {
    return null;
  }

  const normalized = serverDateTime.trim().replace(' ', 'T');
  const withZone =
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized) || /(?:Z|[+-]\d{4})$/i.test(normalized)
      ? normalized
      : `${normalized}Z`;
  const date = new Date(withZone);

  return Number.isNaN(date.getTime()) ? null : date;
};

const parseUtcOffsetMinutes = (rawTimezone: string): number | null => {
  const candidate = rawTimezone.trim().toUpperCase();
  const match = candidate.match(OFFSET_RE);
  if (!match) {
    return null;
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return sign * (hours * 60 + minutes);
};


const formatTimeFromOffset = (dateUtc: Date, offsetMinutes: number): string => {
  const shifted = new Date(dateUtc.getTime() + offsetMinutes * 60_000);
  const hh = String(shifted.getUTCHours()).padStart(2, '0');
  const mm = String(shifted.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const tryFormatWithIana = (dateUtc: Date, timeZone: string): string | null => {
  try {
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    });
    const parts = formatter.formatToParts(dateUtc);
    const hh = parts.find((part) => part.type === 'hour')?.value;
    const mm = parts.find((part) => part.type === 'minute')?.value;
    return hh && mm ? `${hh}:${mm}` : null;
  } catch {
    return null;
  }
};

export const formatUtcToTenantHHmm = (
  serverDateTime: string,
  timezone: TenantTimezone,
): string => {
  const dateUtc = toUtcDate(serverDateTime);
  if (!dateUtc) {
    return '';
  }

  const candidates = [timezone?.name, timezone?.code]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const byIana = tryFormatWithIana(dateUtc, candidate);
    if (byIana) {
      return byIana;
    }

    const offsetMinutes = parseUtcOffsetMinutes(candidate);
    if (offsetMinutes !== null) {
      return formatTimeFromOffset(dateUtc, offsetMinutes);
    }
  }

  // Fallback: keep UTC, so we avoid browser-local shifts.
  const hh = String(dateUtc.getUTCHours()).padStart(2, '0');
  const mm = String(dateUtc.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};
