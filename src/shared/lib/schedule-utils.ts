import { AvailableDoctorsData, NearestAvailableTimeslot } from '../api/schedules';
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
 * Парсит backend-дату в UTC.
 * Backend присылает "YYYY-MM-DD HH:mm:ss" как UTC без suffix.
 */
function parseUtcDateTime(dateTimeStr: string): Date {
  const [datePart, timePart] = dateTimeStr.split(' ');
  return new Date(`${datePart}T${timePart}Z`);
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
  let nearest: NearestAvailableTimeslot | null = null;
  let nearestDate: Date | null = null;

  for (const item of doctorData.items) {
    const nearestTimeslot = item.nearest_available_timeslot;
    if (!nearestTimeslot?.from) continue;
    const itemDate = parseUtcDateTime(nearestTimeslot.from);
    if (itemDate < now) continue;

    if (!nearest || itemDate < nearestDate!) {
      nearest = nearestTimeslot;
      nearestDate = itemDate;
    }
  }

  return nearest;
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
  const [targetUtcDate] = dateTimeStr.split(' ');

  const now = new Date();
  const todayUtcDate = now.toISOString().slice(0, 10);
  const tomorrowUtcDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // Форматируем дату для запроса (полночь выбранной даты)
  const dateForRequest = formatLocalMidnight(date);

  if (targetUtcDate === todayUtcDate) {
    return {
      text: 'сегодня',
      date: dateForRequest,
    };
  }

  if (targetUtcDate === tomorrowUtcDate) {
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
