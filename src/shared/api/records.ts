import { apiClient } from './instance';

export type CreateRecordPayload = {
  appointment: {
    department_id: number;
    employee_id: number;
    from: string;
    to: string;
  };
  owner_id?: number;
  patient_id?: number;
};

export async function createRecord(payload: CreateRecordPayload): Promise<void> {
  // Убираем Authorization header для внешних виджетов
  // Передаем headers без Authorization
  return apiClient.post(
    '/api/v1/tenant/external/widgets/online-appointment/records',
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
