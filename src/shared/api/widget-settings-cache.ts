import { normalizeExternalBaseUrl } from './external-base-url';
/**
 * Интерфейс расписания филиала из API
 */
interface FilialSchedule {
  id: number;
  week_day: string;
  from: string;
  to: string;
  is_around_the_clock: boolean;
}

/**
 * Интерфейс адреса из API
 */
interface ResidentialAddress {
  id: number;
  district: string | null;
  settlement: string | null;
  street: string | null;
  house: string | null;
  hull: string | null;
  apartment: string | null;
  index: string | null;
  comment: string | null;
}

/**
 * Интерфейс филиала из API
 */
export interface FilialApiData {
  id: number;
  name: string;
  is_active: boolean;
  phone_number: string | null;
  has_employees: boolean;
  residential_address: ResidentialAddress | null;
  schedules: FilialSchedule[];
  timezone: {
    name: string;
    code: string;
  } | null;
  organizations: unknown[];
  deleted_at: string | null;
  deleted_by: number | null;
}

/**
 * Интерфейс должности из API
 */
interface JobPositionForDocuments {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: number | null;
}

/**
 * Интерфейс сотрудника из API настроек виджета
 */
export interface EmployeeApiData {
  id: number;
  name: string;
  surname: string;
  patronymic: string | null;
  phone_number: string | null;
  is_owner_tenant: boolean;
  job_position_for_documents: JobPositionForDocuments | null;
  roles: unknown[];
  photo: string | null;
  email: string;
  info: string | null;
}

/**
 * Интерфейс отделения из API настроек виджета
 */
export interface DepartmentApiData {
  id: number;
  name: string;
  is_online_consultation: boolean;
  is_pre_entry: boolean;
  has_employees: boolean;
  filial: FilialApiData;
  deleted_at: string | null;
  deleted_by: number | null;
  is_hospital: boolean;
  hospital_boxes: unknown[];
  free_box_count: number;
}

/**
 * Интерфейс изображения из API
 */
interface LogoImage {
  id: number;
  name: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
  original_link: string;
  download_link: string;
  webp_preview_link: string;
  jpeg_preview_link: string;
}

/**
 * Интерфейс юридических документов из API
 */
interface LegalDocuments {
  type: string;
  value: string;
}

/**
 * Интерфейс кнопки онлайн-записи из API
 */
interface OnlineAppointmentButton {
  display_on_site: boolean;
  decoration: {
    ripple_effect: boolean;
    color: string;
    position_on_site: string;
  };
  js_code: string;
  link_for_site: string;
}

/**
 * Интерфейс ответа API для настроек виджета
 */
export interface WidgetSettingsApiResponse {
  status: string;
  reason: string | null;
  data: {
    logo_image: LogoImage | null;
    widget_theme: string;
    filials: FilialApiData[];
    yandex_map_frame: string | null;
    show_departments: boolean;
    departments: DepartmentApiData[];
    show_employee_position: boolean;
    show_employee_info: boolean;
    employees: EmployeeApiData[];
    legal_documents: LegalDocuments;
    image_pc: string | null;
    image_mobile: string | null;
    online_appointment_button: OnlineAppointmentButton;
  };
  validation_errors: Record<string, unknown>;
}

/**
 * Кеш для данных настроек виджета
 */
let settingsCache: WidgetSettingsApiResponse | null = null;
let cachePromise: Promise<WidgetSettingsApiResponse> | null = null;
let cachedApiUrl: string | null = null;

/**
 * Получить настройки виджета (с кешированием)
 * @param apiUrl - Базовый URL API (например, 'https://test.dev10.getwell.ru')
 */
export async function getWidgetSettings(apiUrl?: string): Promise<WidgetSettingsApiResponse> {
  // Если передан новый apiUrl, очищаем кеш
  if (apiUrl && apiUrl !== cachedApiUrl) {
    settingsCache = null;
    cachePromise = null;
    cachedApiUrl = apiUrl;
  }

  // Если данные уже в кеше, возвращаем их
  if (settingsCache) {
    return settingsCache;
  }

  // Если запрос уже выполняется, ждем его
  if (cachePromise) {
    return cachePromise;
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

  // Формируем полный URL.
  // В config.apiUrl допускаем как base (.../api/v1/tenant/external), так и полный URL settings.
  const normalizedBase = normalizeExternalBaseUrl(baseUrl);
  const fullUrl = `${normalizedBase}/widgets/online-appointment/settings`;

  // Выполняем новый запрос
  cachePromise = fetch(fullUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data: WidgetSettingsApiResponse) => {
      if (data.status === 'ok') {
        settingsCache = data;
      }
      return data;
    })
    .catch((error) => {
      cachePromise = null;
      throw error;
    });

  return cachePromise;
}

/**
 * Очистить кеш
 */
export function clearSettingsCache(): void {
  settingsCache = null;
  cachePromise = null;
}
