import { Branch } from '../../types';
import { BranchesResponse } from '../types/api';
import { apiClient, RequestParams } from './instance';

/**
 * Интерфейс расписания филиала из API
 */
interface FilialSchedule {
  id: number;
  week_day: string;
  from: string;
  to: string;
  is_around_the_clock: boolean;
}

/**
 * Интерфейс адреса из API
 */
interface ResidentialAddress {
  id: number;
  district: string | null;
  settlement: string | null;
  street: string | null;
  house: string | null;
  hull: string | null;
  apartment: string | null;
  index: string | null;
  comment: string | null;
}

/**
 * Интерфейс организации из API
 */
interface Organization {
  id: number;
  organization_name: string;
  clinic_name: string;
  inn: string | null;
  is_active: boolean;
  prefix: string | null;
  residential_address: ResidentialAddress | null;
  filials: unknown[];
  ogrn_ogrnip: string | null;
  deleted_at: string | null;
  deleted_by: number | null;
}

/**
 * Интерфейс филиала из API
 */
interface FilialApiData {
  id: number;
  name: string;
  is_active: boolean;
  phone_number: string | null;
  has_employees: boolean;
  residential_address: ResidentialAddress | null;
  schedules: FilialSchedule[];
  timezone: {
    name: string;
    code: string;
  } | null;
  organizations: Organization[];
  deleted_at: string | null;
  deleted_by: number | null;
}

/**
 * Интерфейс ответа API для списка филиалов
 */
interface FilialsApiResponse {
  status: string;
  reason: string | null;
  data: FilialApiData[];
  meta: {
    per_page: number;
    current_page: number;
    last_page: number;
    total: number;
    from: number;
  };
  validation_errors: Record<string, unknown>;
}

/**
 * Преобразование расписания в читаемую строку
 */
function formatSchedule(schedules: FilialSchedule[]): string {
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

  const scheduleMap = new Map<string, FilialSchedule[]>();
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
    address: filial?.residential_address?.street || '',
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
   * @param params - Параметры запроса (page, per_page и т.д.)
   */
  async getAll(params?: { page?: number; per_page?: number }): Promise<BranchesResponse> {
    try {
      const requestParams: RequestParams = {
        page: params?.page || 1,
        per_page: params?.per_page || 1,
      };

      const response = await apiClient.get<FilialsApiResponse>(
        '/tenant/catalogues/filials',
        requestParams,
      );

      // Проверяем статус ответа
      if (response.status !== 'ok') {
        return {
          data: [],
          success: false,
          message: response.reason || 'Failed to fetch branches',
        };
      }

      // Преобразуем данные из формата API в формат приложения
      // Фильтруем только активные филиалы
      const branches: Branch[] = (response.data || [])
        .filter((filial) => filial.is_active !== false)
        .map(mapFilialToBranch);

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
      const response = await apiClient.get<{
        status: string;
        reason: string | null;
        data: FilialApiData;
        validation_errors: Record<string, unknown>;
      }>(`/tenant/catalogues/filials/${id}`);

      // Проверяем статус ответа
      if (response.status !== 'ok' || !response.data) {
        return null;
      }

      // Проверяем, что филиал активен
      if (response.data.is_active === false) {
        return null;
      }

      return mapFilialToBranch(response.data);
    } catch (error) {
      console.error(`Error fetching branch ${id}:`, error);
      return null;
    }
  },
};
