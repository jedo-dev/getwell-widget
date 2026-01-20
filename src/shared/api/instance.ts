import { ApiError } from '../types/api';
const token = '';
/**
 * Конфигурация API клиента
 */
export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Параметры запроса
 */
export interface RequestParams {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * HTTP клиент для API запросов
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 30000; // 30 секунд по умолчанию

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...config.headers,
    };
  }

  /**
   * Получить базовый URL из конфигурации виджета
   */
  private getBaseURL(): string {
    // Пытаемся получить apiUrl из глобального состояния виджета
    if (typeof window !== 'undefined' && (window as any).GetWellWidget) {
      console.log('*** penis***', window.GetWellWidget.getState() );
      const state = window.GetWellWidget.getState();
      console.log('*** here we are thart***', state);
      if (state?.config?.apiUrl) {
        const apiUrl = state.config.apiUrl;
        // Если URL уже содержит /api/v1, используем как есть
        // if (apiUrl.includes('/api/v1')) {
        //   const baseUrl = apiUrl.replace(/\/api\/v1.*$/, '/api/v1');
        //   console.log('[API Client] Base URL from widget config:', baseUrl);
        //   return baseUrl;
        // }
        // // Иначе добавляем /api/v1
        // const baseUrl = `${apiUrl.replace(/\/$/, '')}/api/v1`;
        // console.log('[API Client] Base URL from widget config:', baseUrl);

        return apiUrl;
      }
    }
    // Fallback на переданный baseURL
    const fallbackUrl = this.baseURL || '';
    if (fallbackUrl) {
      console.log('[API Client] Using fallback base URL:', fallbackUrl);
    } else {
      console.warn('[API Client] No base URL configured!');
    }
    return fallbackUrl;
  }

  /**
   * Построить полный URL с параметрами запроса
   */
  private buildURL(endpoint: string, params?: RequestParams): string {
    const baseURL = this.getBaseURL();
    let url = `${baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  /**
   * Обработка ошибок
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: `HTTP error! status: ${response.status} ${response.statusText}`,
        code: `HTTP_${response.status}`,
      };
    }

    const error: ApiError = {
      message: errorData.message || `Request failed with status ${response.status}`,
      code: errorData.code || `HTTP_${response.status}`,
      details: errorData.details,
    };

    throw error;
  }

  /**
   * Выполнить запрос с таймаутом
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          code: 'TIMEOUT',
        } as ApiError;
      }
      throw error;
    }
  }

  /**
   * Базовый метод для GET запросов
   */
  async get<T>(endpoint: string, params?: RequestParams, config?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint, params);
    console.log('[API Client] GET request:', url);

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        ...config,
      });

      console.log('[API Client] Response status:', response.status, response.statusText);

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      console.log('[API Client] Response data:', data);
      return data;
    } catch (error) {
      console.error('[API Client] Request failed:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Базовый метод для POST запросов
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...config,
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Базовый метод для PUT запросов
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        ...config,
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Базовый метод для DELETE запросов
   */
  async delete<T>(endpoint: string, config?: RequestInit): Promise<T> {
    const url = this.buildURL(endpoint);

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE',
        ...config,
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      // DELETE может не возвращать тело ответа
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }
}

/**
 * Создание экземпляра API клиента
 */
export function createApiClient(config: ApiConfig = {}): ApiClient {
  return new ApiClient(config);
}

/**
 * Дефолтный экземпляр API клиента
 * Базовый URL будет браться из конфигурации виджета
 */
export const apiClient = createApiClient();
