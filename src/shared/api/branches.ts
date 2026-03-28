import { Branch } from '../../types';
import { BranchesResponse } from '../types/api';
import { formatResidentialAddress } from './address';
import { FilialApiData, getWidgetSettings } from './widget-settings-cache';

/**
 * Преобразование расписания в читаемую строку
 */
function formatSchedule(
  schedules: Array<{ week_day: string; from: string; to: string; is_around_the_clock: boolean }>,
): string {
  if (!schedules || schedules.length === 0) {
    return '';
  }

  // Группируем по дням недели
  const dayNames: Record<string, string> = {
    Monday: 'Пн',
    Tuesday: 'Вт',
    Wednesday: 'Ср',
    Thursday: 'Чт',
    Friday: 'Пт',
    Saturday: 'Сб',
    Sunday: 'Вс',
  };

  const scheduleMap = new Map<
    string,
    Array<{ week_day: string; from: string; to: string; is_around_the_clock: boolean }>
  >();
  schedules.forEach((schedule) => {
    const dayName = dayNames[schedule.week_day] || schedule.week_day;
    if (!scheduleMap.has(dayName)) {
      scheduleMap.set(dayName, []);
    }
    scheduleMap.get(dayName)!.push(schedule);
  });

  // Форматируем время из формата "1969-12-31 21:00:00" в "HH:mm"
  const formatTime = (timeStr: string): string => {
    try {
      const date = new Date(timeStr);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Собираем строку расписания
  const scheduleParts: string[] = [];
  scheduleMap.forEach((daySchedules, dayName) => {
    if (daySchedules.length > 0) {
      const firstSchedule = daySchedules[0];
      if (firstSchedule.is_around_the_clock) {
        scheduleParts.push(`${dayName}: круглосуточно`);
      } else {
        const fromTime = formatTime(firstSchedule.from);
        const toTime = formatTime(firstSchedule.to);
        if (fromTime && toTime) {
          scheduleParts.push(`${dayName}: ${fromTime}-${toTime}`);
        }
      }
    }
  });

  return scheduleParts.join(', ');
}

/**
 * Преобразование данных филиала из API в формат приложения
 */
function mapFilialToBranch(filial: FilialApiData): Branch {
  return {
    id: filial.id,
    name: filial.name,
    address: formatResidentialAddress(filial.residential_address),
    phone: filial.phone_number || '',
    schedule: formatSchedule(filial.schedules || []),
  };
}

/**
 * API для работы с филиалами
 */
export const branchesApi = {
  /**
   * Получить список всех филиалов
   */
  async getAll(): Promise<BranchesResponse> {
    try {
      const settings = await getWidgetSettings();

      // Проверяем статус ответа
      if (settings.status !== 'ok') {
        return {
          data: [],
          success: false,
          message: settings.reason || 'Failed to fetch branches',
        };
      }

      // Извлекаем филиалы из departments или используем filials
      const filials = settings.data.filials || [];
      console.log('***', filials, '***');
      // Преобразуем данные из формата API в формат приложения
      const branches: Branch[] = Array.from(filials.values()).map(mapFilialToBranch);

      return {
        data: branches,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching branches:', error);
      return {
        data: [],
        success: false,
        message:
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'Failed to fetch branches',
      };
    }
  },

  /**
   * Получить филиал по ID
   * @param id - ID филиала
   */
  async getById(id: number): Promise<Branch | null> {
    try {
      const settings = await getWidgetSettings();
      if (settings.status !== 'ok') {
        return null;
      }

      // Ищем филиал в departments
      const filialsFromDepartments = (settings.data.departments || []).map((dept) => dept.filial);
      const filialsFromList = settings.data.filials || [];
      const allFilials = [...filialsFromDepartments, ...filialsFromList];

      const filial = allFilials.find((f) => f.id === id && f.is_active !== false);
      if (!filial) {
        return null;
      }

      return mapFilialToBranch(filial);
    } catch (error) {
      console.error(`Error fetching branch ${id}:`, error);
      return null;
    }
  },
};
