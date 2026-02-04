import { Breed } from '../../types';
import { normalizeExternalBaseUrl } from './external-base-url';
import { apiClient } from './instance';

export interface GenderItem {
  code: string;
  name: string;
  id: number;
}

interface GendersResponse {
  data: GenderItem[];
  page?: number;
  per_page?: number;
  total?: number;
}

type ExternalStatus = 'ok' | 'error';

interface ExternalApiResponse<T> {
  status: ExternalStatus;
  reason: string | null;
  data: T;
  validation_errors?: unknown[];
}

// Кэш для пород
let breedsCache: Breed[] | null = null;
let breedsCachePromise: Promise<Breed[]> | null = null;
let cachedBreedsApiUrl: string | null = null;

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

  /**
   * Получить список пород (с кэшированием на время сессии)
   */
  async getBreeds(apiUrl?: string): Promise<Breed[]> {
    // Если передан новый apiUrl, очищаем кэш
    if (apiUrl && apiUrl !== cachedBreedsApiUrl) {
      breedsCache = null;
      breedsCachePromise = null;
      cachedBreedsApiUrl = apiUrl;
    }

    // Если данные уже в кэше, возвращаем их
    if (breedsCache) {
      return breedsCache;
    }

    // Если запрос уже выполняется, ждем его
    if (breedsCachePromise) {
      return breedsCachePromise;
    }

    // Если apiUrl не передан, пытаемся получить из глобального состояния
    let baseUrl = apiUrl;
    if (!baseUrl && typeof window !== 'undefined' && (window as any).GetWellWidget) {
      const state = (window as any).GetWellWidget.getState?.();
      baseUrl = state?.config?.apiUrl;
    }

    if (!baseUrl) {
      throw new Error(
        'apiUrl is required. Please provide apiUrl parameter or initialize widget with config.',
      );
    }

    const base = normalizeExternalBaseUrl(baseUrl);
    const endpoint = `${base}/widgets/online-appointment/patients/breeds`;

    // Выполняем новый запрос
    breedsCachePromise = apiClient
      .get<ExternalApiResponse<Breed[]>>(endpoint)
      .then((res) => {
        if (res.status !== 'ok') {
          throw new Error(res.reason || 'Failed to fetch breeds');
        }
        breedsCache = res.data || [];
        return breedsCache;
      })
      .catch((error) => {
        breedsCachePromise = null;
        throw error;
      });

    return breedsCachePromise;
  },
};
