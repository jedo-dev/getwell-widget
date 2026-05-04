type TenantTimezone =
  | {
      name?: string | null;
      code?: string | null;
    }
  | null
  | undefined;

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

export const formatUtcToTenantHHmm = (
  serverDateTime: string,
  _timezone: TenantTimezone,
): string => {
  const dateUtc = toUtcDate(serverDateTime);
  if (!dateUtc) {
    return '';
  }
  // Render in browser/user local timezone (PC timezone).
  const hh = String(dateUtc.getHours()).padStart(2, '0');
  const mm = String(dateUtc.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};
