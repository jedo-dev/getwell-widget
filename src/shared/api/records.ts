import { normalizeExternalBaseUrl } from './external-base-url';
import { apiClient } from './instance';

type ExternalStatus = 'ok' | 'error';

interface ExternalApiResponse<T> {
  status: ExternalStatus;
  reason: string | null;
  data: T;
  validation_errors?: unknown[];
}

// Типы для создания нового пациента
interface CreatePatientData {
  nickname: string;
  type_id: string;
  breed_id: string;
  gender_id: string;
  birth_date: string;
}

// Типы для создания нового владельца
interface CreateOwnerData {
  name: string;
  surname: string;
  patronymic: string;
  phone_number: string;
  gender: string;
}

// Базовый тип для appointment
interface AppointmentData {
  department_id: number;
  employee_id: number;
  from: string; // YYYY-MM-DD HH:mm:ss или ISO date-time
  to: string; // YYYY-MM-DD HH:mm:ss или ISO date-time
  comment?: string;
  rsrv_timeslot_unq_hash?: string;
}

// Запрос для авторизованного пользователя (с ID)
interface CreateExternalRecordRequestWithIds {
  appointment: AppointmentData;
  patient_id: number;
  owner_id: number;
}

// Запрос для неавторизованного пользователя (с полными данными)
interface CreateExternalRecordRequestWithData {
  appointment: AppointmentData;
  patient: CreatePatientData;
  owner: CreateOwnerData;
}

// Union тип для поддержки обоих вариантов
export type CreateExternalRecordRequest =
  | CreateExternalRecordRequestWithIds
  | CreateExternalRecordRequestWithData;

export const recordsApi = {
  async createRecord(params: {
    apiUrl: string;
    payload: CreateExternalRecordRequest;
  }): Promise<unknown> {
    const base = normalizeExternalBaseUrl(params.apiUrl);
    const endpoint = `${base}/widgets/online-appointment/records`;

    const res = await apiClient.post<ExternalApiResponse<unknown>>(endpoint, params.payload);
    if (res.status !== 'ok') {
      throw new Error(res.reason || 'Failed to create record');
    }
    return res.data;
  },
};
