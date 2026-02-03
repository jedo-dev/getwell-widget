import { normalizeExternalBaseUrl } from './external-base-url';
import { apiClient } from './instance';

type ExternalStatus = 'ok' | 'error';

interface ExternalApiResponse<T> {
  status: ExternalStatus;
  reason: string | null;
  data: T;
  validation_errors?: unknown[];
}

export interface CreateExternalRecordRequest {
  appointment: {
    department_id: number;
    employee_id: number;
    from: string; // YYYY-MM-DD HH:mm:ss
    to: string;   // YYYY-MM-DD HH:mm:ss
    comment?: string;
  };
  // Внешний контракт поддерживает owner/patient, но в текущем JS-виджете
  // мы отправляем минимум — только appointment.
}

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
