/**
 * Нормализация apiUrl для внешних ендпоинтов.
 *
 * Мы ожидаем, что в config.apiUrl передают "полный URL с префиксами" —
 * например: https://host/api/v1/tenant/external
 *
 * На практике иногда передают уже полный URL settings-ендпоинта.
 * Эта функция приводит всё к base-префиксу .../api/v1/tenant/external
 */
export function normalizeExternalBaseUrl(apiUrl: string): string {
  const trimmed = apiUrl.replace(/\/+$/, '');

  // Если передали полный settings URL — вырезаем хвост
  const settingsSuffix = '/widgets/online-appointment/settings';
  if (trimmed.endsWith(settingsSuffix)) {
    return trimmed.slice(0, -settingsSuffix.length);
  }

  // Если URL содержит /api/v1/tenant/external — оставляем всё до него включительно
  const marker = '/api/v1/tenant/external';
  const idx = trimmed.indexOf(marker);
  if (idx !== -1) {
    return trimmed.slice(0, idx + marker.length);
  }

  // Иначе считаем, что пришёл домен/хост без префикса
  // и добавляем ожидаемый префикс.
  return `${trimmed}${marker}`;
}
