import { normalizeExternalBaseUrl } from './external-base-url';
import { apiClient } from './instance';

export interface GenderItem {
  code: string;
  name: string;
}

interface GendersResponse {
  data: GenderItem[];
  page?: number;
  per_page?: number;
  total?: number;
}

export const patientsApi = {
  /**
   * Получить список полов питомцев
   */
  async getGenders(apiUrl: string, page: number = 1, perPage: number = 20): Promise<GenderItem[]> {
    const base = normalizeExternalBaseUrl(apiUrl);
    const endpoint = `${base}/widgets/online-appointment/patients/genders`;

    const response = await apiClient.get<GendersResponse>(endpoint, {
      page,
      per_page: perPage,
    });

    return response.data || [];
  },
};
