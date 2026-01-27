/**
 * Форматирование даты в локальной таймзоне браузера
 * Формат: YYYY-MM-DD HH:mm:ss (без T, без timezone suffix)
 */

/**
 * Форматирует дату в полночь выбранной даты в локальной таймзоне
 * @param dateISO - ISO строка даты или объект Date
 * @returns Строка в формате "YYYY-MM-DD 00:00:00"
 */
export function formatLocalMidnight(dateISO: string | Date): string {
  const date = typeof dateISO === 'string' ? new Date(dateISO) : dateISO;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day} 10:00:00`;
}

/**
 * Форматирует дату и время в локальной таймзоне
 * @param d - Объект Date
 * @returns Строка в формате "YYYY-MM-DD HH:mm:ss"
 */
export function formatLocalDateTime(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
