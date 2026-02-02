import { AvailableDoctorsData, NearestAvailableTimeslot, ScheduleItem } from '../api/schedules';
import { isToday } from './date-formatting';

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
 * Форматирует дату для отображения ближайшего времени приёма
 * - "сегодня" если это сегодня
 * - "завтра" если это завтра
 * - "ДД.ММ" если через пару дней
 */
export function formatNearestAppointmentDate(dateTimeStr: string | null): string {
  if (!dateTimeStr) {
    return 'нет ближайшей записи';
  }

  const date = parseDateTime(dateTimeStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  if (isToday(date)) {
    return 'сегодня';
  }

  if (targetDate.getTime() === tomorrow.getTime()) {
    return 'завтра';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}
