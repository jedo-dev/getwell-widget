import { Employee } from '../../types';
import { normalizeExternalBaseUrl } from './external-base-url';
import { apiClient } from './instance';

type ExternalStatus = 'ok' | 'error';

export interface ExternalApiResponse<T> {
  status: ExternalStatus;
  reason: string | null;
  data: T;
  validation_errors?: Record<string, unknown>;
  meta?: unknown;
}

export interface JobPositionForDocuments {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: number | null;
}

export interface ExternalDoctorApiData {
  id: number;
  name: string;
  surname: string;
  patronymic?: string | null;
  phone_number?: string | null;
  is_owner_tenant: boolean;
  job_position_for_documents: JobPositionForDocuments | null;
  roles: unknown[];
  photo?: string | null;
  email?: string | null;
  info?: string | null;
  date_of_dismissal?: string | null;
}

export interface NearestAvailableTimeslot {
  record: unknown | null;
  from: string; // YYYY-MM-DD HH:mm:ss
  to: string;   // YYYY-MM-DD HH:mm:ss
  type: string;
}

export interface ScheduleItem {
  id: number;
  from: string; // YYYY-MM-DD HH:mm:ss
  to: string;   // YYYY-MM-DD HH:mm:ss
  type: string;
  breaks: unknown[];
  nearest_available_timeslot: NearestAvailableTimeslot;
}

export interface AvailableDoctorsData {
  employee: ExternalDoctorApiData;
  items: ScheduleItem[];
}

export interface AvailableTimechip {
  from: string; // YYYY-MM-DD HH:mm:ss
  to: string;   // YYYY-MM-DD HH:mm:ss
  is_limited: boolean;
}

function mapDoctorToEmployee(a: { employee: ExternalDoctorApiData }): Employee {
  const d = a.employee
  const position = d.job_position_for_documents?.name || '';
  return {
    id: d.id,
    firstName: d.name || '',
    lastName: d.surname || '',
    patronymic: d.patronymic || undefined,
    photo: d.photo || undefined,
    position,
    specialization: position,
    information: d.info || undefined,
    showInWidget: true,
  };
}

export const schedulesApi = {
  /**
   * Получить список доступных врачей для виджета онлайн-записи.
   */
  async getAvailableDoctors(params: {
    apiUrl: string;
    filialId: number;
    departmentId?: number;
    date?: string; // YYYY-MM-DD HH:mm:ss
    search?: string;
  }): Promise<Employee[]> {
    const base = normalizeExternalBaseUrl(params.apiUrl);
    // В docs путь содержит /widget/.. (singular)
    const endpoint = `${base}/widgets/online-appointment/schedules/employees-and-schedules`;

    const query: Record<string, string | number | undefined> = {
      filial_id: params.filialId,
      ...(params.departmentId ? { 'filter[departments_id]': params.departmentId } : {}),
      ...(params.date ? { 'filter[date]': params.date } : {}),
      ...(params.search ? { 'filter[search]': params.search } : {}),

      // 'filter[schedule_type]': 'online_appointment_widget',
    };

    const res = await apiClient.get<ExternalApiResponse<AvailableDoctorsData[]>>(endpoint, query);
    if (res.status !== 'ok') {
      throw new Error(res.reason || 'Failed to fetch available doctors');
    }

    const doctors = res.data;
    return doctors.map(mapDoctorToEmployee);
  },

  /**
   * Получить список доступных врачей с полными данными расписаний.
   */
  async getAvailableDoctorsWithSchedules(params: {
    apiUrl: string;
    filialId: number;
    departmentId?: number;
    date?: string; // YYYY-MM-DD HH:mm:ss
    search?: string;
  }): Promise<AvailableDoctorsData[]> {
    const base = normalizeExternalBaseUrl(params.apiUrl);
    const endpoint = `${base}/widgets/online-appointment/schedules/employees-and-schedules`;

    const query: Record<string, string | number | undefined> = {
      filial_id: params.filialId,
      ...(params.departmentId ? { 'filter[departments_id]': params.departmentId } : {}),
      ...(params.date ? { 'filter[date]': params.date } : {}),
      ...(params.search ? { 'filter[search]': params.search } : {}),
    };

    const res = await apiClient.get<ExternalApiResponse<AvailableDoctorsData[]>>(endpoint, query);
    if (res.status !== 'ok') {
      throw new Error(res.reason || 'Failed to fetch available doctors');
    }

    return res.data;
  },

  /**
   * Получить доступные слоты на день.
   * appointment_type_id у вас статичный (8), но параметр оставляем явным.
   */
  async getAvailableTimechips(params: {
    apiUrl: string;
    filialId: number;
    appointmentTypeId: number;
    date: string; // YYYY-MM-DD HH:mm:ss
    doctorId?: number;
    departmentId?: number;
  }): Promise<AvailableTimechip[]> {
    const base = normalizeExternalBaseUrl(params.apiUrl);
    const endpoint = `${base}/widgets/online-appointment/schedules/available-timechips`;

    const query: Record<string, string | number | undefined> = {
      appointment_type_id: params.appointmentTypeId,
      date: params.date,
      filial_id: params.filialId,
      ...(params.doctorId ? { 'filter[doctor_id]': params.doctorId } : {}),
      ...(params.departmentId ? { 'filter[department_id]': params.departmentId } : {}),
    };

    const res = await apiClient.get<ExternalApiResponse<AvailableTimechip[]>>(endpoint, query);
    if (res.status !== 'ok') {
      throw new Error(res.reason || 'Failed to fetch timechips');
    }
    return res.data || [];
  },

  /**
   * Забронировать временной слот на 5 минут.
   */
  async reserveTimeslot(params: {
    apiUrl: string;
    timeslot: {
      from: string; // YYYY-MM-DD HH:mm:ss
      to: string;   // YYYY-MM-DD HH:mm:ss
    };
    departmentId: number;
    employeeId: number;
    uniqueHash?: string; // для отмены резервирования
  }): Promise<{ unique_hash: string }> {
    const base = normalizeExternalBaseUrl(params.apiUrl);
    const endpoint = `${base}/widgets/online-appointment/reserve-timeslot`;

    const payload: {
      timeslot: {
        from: string;
        to: string;
      };
      department_id: number;
      employee_id: number;
      unique_hash?: string;
    } = {
      timeslot: {
        from: params.timeslot.from,
        to: params.timeslot.to,
      },
      department_id: params.departmentId,
      employee_id: params.employeeId,
    };

    if (params.uniqueHash) {
      payload.unique_hash = params.uniqueHash;
    }

    let res: ExternalApiResponse<{ unique_hash: string }>;
    try {
      res = await apiClient.post<ExternalApiResponse<{ unique_hash: string }>>(endpoint, payload);
    } catch (error: any) {
      // Если ошибка пришла как HTTP 500, но с JSON, пытаемся извлечь данные
      if (error && typeof error === 'object' && 'details' in error && error.details) {
        const details = error.details;
        if (typeof details === 'object' && 'status' in details && details.status === 'error') {
          res = details as ExternalApiResponse<{ unique_hash: string }>;
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    if (res.status === 'error') {
      if (res.reason === 'duplicate_entry') {
        const error = new Error(res.reason || 'Time slot is already reserved');
        (error as any).code = 'DUPLICATE_ENTRY';
        throw error;
      }
      throw new Error(res.reason || 'Failed to reserve timeslot');
    }

    if (!res.data || typeof res.data !== 'object' || !('unique_hash' in res.data)) {
      throw new Error('Invalid response format');
    }

    return res.data;
  },

  /**
   * Отменить резервирование временного слота.
   */
  async cancelTimeslotReservation(params: {
    apiUrl: string;
    uniqueHash: string;
  }): Promise<void> {
    const base = normalizeExternalBaseUrl(params.apiUrl);
    const endpoint = `${base}/widgets/online-appointment/reserve-timeslot`;

    const payload = {
      unique_hash: params.uniqueHash,
    };

    const res = await apiClient.post<ExternalApiResponse<unknown>>(endpoint, payload);
    if (res.status !== 'ok') {
      throw new Error(res.reason || 'Failed to cancel timeslot reservation');
    }
  },
};
