/**
 * Базовый HTTP клиент для API запросов
 * В будущем здесь можно использовать axios, fetch или другой HTTP клиент
 */

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(config: ApiConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 5000;
  }

  /**
   * Имитация сетевой задержки
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Базовый метод для GET запросов
   */
  async get<T>(url: string, config?: RequestInit): Promise<T> {
    // Имитация сетевой задержки
    await this.delay(300 + Math.random() * 200);

    // В реальной реализации здесь будет fetch или axios
    // const response = await fetch(`${this.baseURL}${url}`, {
    //   method: 'GET',
    //   ...config,
    // });
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // return await response.json();

    // Для моков просто возвращаем пустой объект
    // Реальные данные будут в конкретных методах API
    return {} as T;
  }

  /**
   * Базовый метод для POST запросов
   */
  async post<T>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    // Имитация сетевой задержки
    await this.delay(400 + Math.random() * 300);

    // В реальной реализации здесь будет fetch или axios
    // const response = await fetch(`${this.baseURL}${url}`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     ...config?.headers,
    //   },
    //   body: JSON.stringify(data),
    //   ...config,
    // });
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // return await response.json();

    // Для моков просто возвращаем данные обратно
    return data as T;
  }

  /**
   * Базовый метод для PUT запросов
   */
  async put<T>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    await this.delay(400 + Math.random() * 300);
    return data as T;
  }

  /**
   * Базовый метод для DELETE запросов
   */
  async delete<T>(url: string, config?: RequestInit): Promise<T> {
    await this.delay(300 + Math.random() * 200);
    return {} as T;
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
 */
export const apiClient = createApiClient();

