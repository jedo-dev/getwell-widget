import { apiClient } from './instance';
import { normalizeExternalBaseUrl } from './external-base-url';
import { normalizePhoneForLookup } from '../lib';

type ExternalStatus = 'ok' | 'error';

export interface ExternalApiResponse<T> {
  status: ExternalStatus;
  reason: string | null;
  data: T;
  meta?: {
    per_page: number;
    current_page: number;
    last_page: number;
    total: number;
    from: number;
  };
  validation_errors?: Record<string, unknown>;
}

export interface Patient {
  id: number;
  nickname: string;
  gender: {
    id: number;
    name: string;
  };
  breed: {
    id: number;
    name: string;
    patient_type: {
      id: number;
      name: string;
      breeds_count: number;
      created_at: string;
      deleted_at: string | null;
      deleted_by: number | null;
    };
    deleted_at: string | null;
    deleted_by: number | null;
  };
  birth_date: string;
  owner: number | null;
}

export interface Owner {
  id: number;
  surname: string;
  name: string;
  patronymic: string;
  gender: 'male' | 'female';
  phone_number: string;
  patients: Patient[];
}

export interface OwnersShortResponse {
  status: ExternalStatus;
  reason: string | null;
  data: Owner[];
  meta: {
    per_page: number;
    current_page: number;
    last_page: number;
    total: number;
    from: number;
  };
  validation_errors: Record<string, unknown>;
}

export const ownersApi = {
  /**
   * Получить владельцев по номеру телефона
   */
  async getByPhone(params: { apiUrl: string; phone: string }): Promise<OwnersShortResponse> {
    const base = normalizeExternalBaseUrl(params.apiUrl);
    const phoneDigits = normalizePhoneForLookup(params.phone);
    const endpoint = `${base}/widgets/online-appointment/owners/short`;

    const res = await apiClient.get<OwnersShortResponse>(endpoint, {
      'filter[phone_number]': phoneDigits,
    });

    if (res.status !== 'ok') {
      throw new Error(res.reason || 'Failed to get owners');
    }

    return res;
  },
};
