import { DAYS_OF_WEEK, MONTHS_GENITIVE, MONTHS_NOMINATIVE } from '../constants/date-formatting';

/**
 * Утилиты для форматирования дат
 */

export interface FormattedDate {
  date: string;
  time: string;
}

/**
 * Форматирует дату в читаемый формат: "Понедельник, 15 января"
 * @param date - Дата для форматирования
 * @returns Отформатированная строка даты
 */
export function formatDate(date: Date): string {
  const dayName = DAYS_OF_WEEK[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_GENITIVE[date.getMonth()];

  return `${dayName}, ${day} ${month}`;
}

/**
 * Форматирует месяц и год: "Январь, 2024"
 * @param date - Дата для форматирования
 * @returns Отформатированная строка месяца и года
 */
export function formatMonthYear(date: Date): string {
  const month = MONTHS_NOMINATIVE[date.getMonth()];
  return `${month}, ${date.getFullYear()}`;
}

/**
 * Форматирует время: "HH:MM"
 * @param date - Дата для форматирования
 * @returns Отформатированная строка времени
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Форматирует ISO строку даты и времени в объект с датой и временем
 * @param dateTime - ISO строка даты и времени
 * @returns Объект с отформатированными датой и временем или null
 */
export function formatDateTime(dateTime: string | null): FormattedDate | null {
  if (!dateTime) return null;

  const date = new Date(dateTime);
  return {
    date: formatDate(date),
    time: formatTime(date),
  };
}

/**
 * Проверяет, является ли дата сегодняшним днем
 * @param date - Дата для проверки
 * @returns true, если дата сегодняшняя
 */
export function isToday(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Проверяет, является ли дата прошедшей
 * @param date - Дата для проверки
 * @returns true, если дата в прошлом
 */
export function isPastDate(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Проверяет, принадлежит ли дата текущему месяцу
 * @param date - Дата для проверки
 * @param currentMonth - Текущий месяц для сравнения
 * @returns true, если дата в текущем месяце
 */
export function isCurrentMonth(date: Date | null, currentMonth: Date): boolean {
  if (!date) return false;
  return (
    date.getMonth() === currentMonth.getMonth() &&
    date.getFullYear() === currentMonth.getFullYear()
  );
}

