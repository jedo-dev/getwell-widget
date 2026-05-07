import { ApiError } from '../types/api';
import { getCalltouchSessionId } from '../utils/calltouch';
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
      console.log('*** penis***', window.GetWellWidget.getState());
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
   * Построить query string вручную через encodeURIComponent
   * Это гарантирует, что пробелы будут %20, а не + (как в URLSearchParams)
   * @param params - Параметры запроса
   * @returns Query string без ведущего ?
   */
  private buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
    const pairs: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(String(value));
        pairs.push(`${encodedKey}=${encodedValue}`);
      }
    });
    return pairs.join('&');
  }

  /**
   * Построить полный URL с параметрами запроса
   */
  private buildURL(endpoint: string, params?: RequestParams): string {
    // Если пришёл абсолютный URL — используем как есть
    let url = endpoint;
    if (!/^https?:\/\//i.test(endpoint)) {
      const baseURL = this.getBaseURL();
      url = `${baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    }

    if (params) {
      const queryString = this.buildQuery(params);
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  /**
   * Обработка ошибок
   */
  private async handleError(response: Response, jsonData?: any): Promise<never> {
    let errorData: ApiError;

    if (jsonData) {
      // Используем уже распарсенные данные
      errorData = jsonData;
    } else {
      // Пытаемся распарсить JSON из ответа
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        } else {
          errorData = {
            message: `HTTP error! status: ${response.status} ${response.statusText}`,
            code: `HTTP_${response.status}`,
          };
        }
      } catch {
        errorData = {
          message: `HTTP error! status: ${response.status} ${response.statusText}`,
          code: `HTTP_${response.status}`,
        };
      }
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
    const externalSignal = options.signal;

    const abortByExternalSignal = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', abortByExternalSignal, { once: true });
      }
    }

    try {
      const calltouchSessionId = getCalltouchSessionId();
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
          ...(calltouchSessionId ? { session_id: calltouchSessionId } : {}),
        },
      });
      clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', abortByExternalSignal);
      }
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', abortByExternalSignal);
      }
      if (error instanceof Error && error.name === 'AbortError') {
        if (externalSignal?.aborted) {
          throw {
            message: 'Request canceled',
            code: 'ABORTED',
          } as ApiError;
        }
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
 const calltouchSessionId = getCalltouchSessionId();
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...config,
         ...(calltouchSessionId ? { session_id: calltouchSessionId } : {}),
      });

      // Пытаемся распарсить JSON, даже если статус не OK
      let jsonData: any;
      try {
        const text = await response.text();
        if (!text) {
          if (!response.ok) {
            await this.handleError(response);
          }
          throw {
            message: 'Empty response',
            code: 'EMPTY_RESPONSE',
          } as ApiError;
        }
        jsonData = JSON.parse(text);
      } catch (parseError) {
        // Если не удалось распарсить JSON, обрабатываем как обычную ошибку
        if (!response.ok) {
          await this.handleError(response);
        }
        throw {
          message: 'Invalid JSON response',
          code: 'INVALID_JSON',
        } as ApiError;
      }

      // Если статус не OK, но это может быть ExternalApiResponse со status: "error"
      if (!response.ok) {
        // Проверяем, является ли это ExternalApiResponse с status: "error"
        if (jsonData && typeof jsonData === 'object' && 'status' in jsonData && jsonData.status === 'error') {
          // Возвращаем данные как есть, пусть вызывающий код обработает status: "error"
          return jsonData as T;
        }
        // Иначе обрабатываем как обычную ошибку
        await this.handleError(response, jsonData);
      }

      return jsonData;
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
