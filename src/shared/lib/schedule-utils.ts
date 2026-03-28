import { AvailableDoctorsData, NearestAvailableTimeslot, ScheduleItem } from '../api/schedules';
import { isToday } from './date-formatting';
import { formatLocalMidnight } from './datetime';

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const;

/**
 * Парсит строку даты в формате "YYYY-MM-DD HH:mm:ss" в объект Date
 */
function parseDateTime(dateTimeStr: string): Date {
  const [datePart, timePart] = dateTimeStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes || 0, 0);
}

/**
 * Находит ближайший доступный timeslot из items
 */
export function findNearestTimeslot(
  doctorData: AvailableDoctorsData | undefined,
): NearestAvailableTimeslot | null {
  if (!doctorData || !doctorData.items || doctorData.items.length === 0) {
    return null;
  }

  const now = new Date();
  let nearest: ScheduleItem | null = null;
  let nearestDate: Date | null = null;

  for (const item of doctorData.items) {
    const itemDate = parseDateTime(item.from);
    if (itemDate < now) continue;

    if (!nearest || itemDate < nearestDate!) {
      nearest = item;
      nearestDate = itemDate;
    }
  }

  return nearest?.nearest_available_timeslot || null;
}

/**
 * Результат форматирования даты ближайшего времени приёма
 */
export interface NearestAppointmentDateResult {
  text: string;
  date: string | null; // YYYY-MM-DD 00:00:00 для использования в запросах
}

/**
 * Форматирует дату для отображения ближайшего времени приёма
 * - "сегодня" если это сегодня
 * - "завтра" если это завтра
 * - "с 15 ноября" если через пару дней
 * Возвращает объект с текстом для отображения и датой для запросов
 */
export function formatNearestAppointmentDate(
  dateTimeStr: string | null,
): NearestAppointmentDateResult {
  if (!dateTimeStr) {
    return {
      text: 'нет ближайшей записи',
      date: null,
    };
  }

  const date = parseDateTime(dateTimeStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Форматируем дату для запроса (полночь выбранной даты)
  const dateForRequest = formatLocalMidnight(date);

  if (isToday(date)) {
    return {
      text: 'сегодня',
      date: dateForRequest,
    };
  }

  if (targetDate.getTime() === tomorrow.getTime()) {
    return {
      text: 'завтра',
      date: dateForRequest,
    };
  }

  const day = date.getDate();
  const month = MONTHS_GENITIVE[date.getMonth()];
  return {
    text: `с ${day} ${month}`,
    date: dateForRequest,
  };
}
