import { Employee } from '../../types';
import { apiClient } from './instance';
import { normalizeExternalBaseUrl } from './external-base-url';

type ExternalStatus = 'ok' | 'error';

export interface ExternalApiResponse<T> {
  status: ExternalStatus;
  reason: string | null;
  data: T;
  validation_errors?: unknown[];
  meta?: unknown;
}

export interface ExternalDoctorApiData {
  id: number;
  name: string;
  surname: string;
  patronymic?: string | null;
  phone_number?: string | null;
  job_position_for_documents?: { id: number; name: string } | null;
  photo?: string | null;
  email?: string | null;
  info?: string | null;
}

export interface AvailableDoctorsData {
  by_appointment: ExternalDoctorApiData[];
  by_live_queue: ExternalDoctorApiData[];
  by_online_appointment_widget: ExternalDoctorApiData[];
}

export interface AvailableTimechip {
  from: string; // YYYY-MM-DD HH:mm:ss
  to: string;   // YYYY-MM-DD HH:mm:ss
  is_limited: boolean;
}

function mapDoctorToEmployee(d: ExternalDoctorApiData): Employee {
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
    const endpoint = `${base}/widget/online-appointment/schedules/available-doctors`;

    const query: Record<string, string | number | undefined> = {
      filial_id: params.filialId,
      ...(params.departmentId ? { 'filter[department_id]': params.departmentId } : {}),
      ...(params.date ? { 'filter[date]': params.date } : {}),
      ...(params.search ? { 'filter[search]': params.search } : {}),
      // Мы целимся в виджетный тип расписания
      'filter[schedule_type]': 'online_appointment_widget',
    };

    const res = await apiClient.get<ExternalApiResponse<AvailableDoctorsData>>(endpoint, query);
    if (res.status !== 'ok') {
      throw new Error(res.reason || 'Failed to fetch available doctors');
    }

    const doctors = res.data?.by_online_appointment_widget || [];
    return doctors.map(mapDoctorToEmployee);
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
    const endpoint = `${base}/widget/online-appointment/schedules/available-timechips`;

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
};
