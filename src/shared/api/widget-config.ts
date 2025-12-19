import { Branch, Department, Employee, WidgetConfig } from '../../types';

/**
 * Короткая информация о филиале из API
 */
interface ShortFiliaDto {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  schedule?: string;
}

/**
 * Короткая информация об отделении из API
 */
interface ShortDepartmentDto {
  id: number;
  name: string;
}

/**
 * Короткая информация о сотруднике из API
 */
interface EmployeeShortInfoDto {
  id: number;
  firstName: string;
  lastName: string;
  patronymic?: string;
  photo?: string;
  position?: string;
  specialization?: string;
  information?: string;
}

/**
 * Информация об отделении с сотрудниками
 */
interface DepartmentInfo {
  department: ShortDepartmentDto;
  employees: EmployeeShortInfoDto[];
}

/**
 * Информация о филиале с отделениями
 */
interface FilialInfo {
  filial: ShortFiliaDto;
  departments_info: DepartmentInfo[];
}

/**
 * Изображения виджета
 */
interface ImageUrls {
  logo: string | null;
  for_pc: string | null;
  for_mobile: string | null;
}

/**
 * Юридические документы
 */
interface LegalDocuments {
  privacy_policy: {
    text: string | null;
    link: string | null;
  };
}

/**
 * Настройки кнопки онлайн-записи
 */
interface OnlineAppointmentButton {
  display_on_site: boolean;
  ripple_effect: boolean;
  color: string;
  position_on_site: string;
  js_code: string;
  link_for_site: string;
}

/**
 * Ответ API с настройками виджета
 */
export interface OnlineAppointmentWidgetSettingsDto {
  image_urls: ImageUrls;
  widget_theme: string;
  filials_info: FilialInfo[];
  departments_display_in_widget: boolean;
  employee_display_position: boolean;
  employee_display_info: boolean;
  yandex_map_iframe_string: string | null;
  legal_documents: LegalDocuments;
  online_appointment_button: OnlineAppointmentButton;
}

/**
 * Преобразование данных из API в формат WidgetConfig
 */
function mapApiResponseToWidgetConfig(
  apiResponse: OnlineAppointmentWidgetSettingsDto,
  initialConfig: WidgetConfig,
): WidgetConfig {
  // Собираем все филиалы
  const branches: Branch[] = apiResponse.filials_info.map((filialInfo) => ({
    id: filialInfo.filial.id,
    name: filialInfo.filial.name,
    address: filialInfo.filial.address || '',
    phone: filialInfo.filial.phone || '',
    schedule: filialInfo.filial.schedule || '',
  }));

  // Собираем все отделения
  const departments: Department[] = [];
  apiResponse.filials_info.forEach((filialInfo) => {
    filialInfo.departments_info.forEach((deptInfo) => {
      if (!departments.find((d) => d.id === deptInfo.department.id)) {
        departments.push({
          id: deptInfo.department.id,
          name: deptInfo.department.name,
          showInWidget: true,
        });
      }
    });
  });

  // Собираем всех сотрудников
  const employees: Employee[] = [];
  apiResponse.filials_info.forEach((filialInfo) => {
    filialInfo.departments_info.forEach((deptInfo) => {
      deptInfo.employees.forEach((emp) => {
        if (!employees.find((e) => e.id === emp.id)) {
          employees.push({
            id: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            patronymic: emp.patronymic,
            photo: emp.photo,
            position: emp.position || '',
            specialization: emp.specialization || '',
            information: emp.information,
            showInWidget: true,
          });
        }
      });
    });
  });

  // Формируем конфиг
  const config: WidgetConfig = {
    ...initialConfig,
    // Изображения
    logoUrl: apiResponse.image_urls.logo || undefined,
    desktopImageUrl: apiResponse.image_urls.for_pc || undefined,
    mobileImageUrl: apiResponse.image_urls.for_mobile || undefined,
    logo: apiResponse.image_urls.logo || undefined,

    // Тема
    theme: {
      ...initialConfig.theme,
      // widget_theme может быть строкой с цветом или enum
      primaryColor: apiResponse.widget_theme || initialConfig.theme?.primaryColor || '#344054',
    },

    // Данные
    branches,
    departments,
    employees,

    // Настройки отображения
    showDepartments: apiResponse.departments_display_in_widget,
    showEmployeePosition: apiResponse.employee_display_position,
    showDoctorInfo: apiResponse.employee_display_info,

    // Яндекс карты
    yandexMapFrameCode: apiResponse.yandex_map_iframe_string || undefined,

    // Политика конфиденциальности
    textPolicy: apiResponse.legal_documents.privacy_policy.text || undefined,
    linkToExternalPolicy: apiResponse.legal_documents.privacy_policy.link || undefined,
    isExternalLinkPolicy: !!apiResponse.legal_documents.privacy_policy.link,

    // Кнопка онлайн-записи
    stickyBtnEnable: apiResponse.online_appointment_button.display_on_site,
    stickyButtonPulse: apiResponse.online_appointment_button.ripple_effect,
    stickyButtonColor: apiResponse.online_appointment_button.color,
    stickyButtonPosition:
      apiResponse.online_appointment_button.position_on_site === 'left' ? 'left' : 'right',
  };

  return config;
}

/**
 * API для работы с конфигурацией виджета
 */
export const widgetConfigApi = {
  /**
   * Получить конфигурацию виджета
   * @param apiUrl - URL API для запроса
   */
  async getConfig(apiUrl: string): Promise<OnlineAppointmentWidgetSettingsDto | null> {
    try {
      // Формируем базовый URL
      const baseUrl = apiUrl.includes('/api/v1')
        ? apiUrl.replace(/\/api\/v1.*$/, '/api/v1')
        : `${apiUrl.replace(/\/$/, '')}/api/v1`;

      const response = await fetch(`${baseUrl}/online-appointment-widget/get-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch widget config:', response.status, response.statusText);
        return null;
      }

      const data: OnlineAppointmentWidgetSettingsDto = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching widget config:', error);
      return null;
    }
  },
};

/**
 * Получить конфигурацию виджета и преобразовать в WidgetConfig
 */
export async function fetchWidgetConfig(initialConfig: WidgetConfig): Promise<WidgetConfig | null> {
  if (!initialConfig.apiUrl) {
    return null;
  }

  const apiResponse = await widgetConfigApi.getConfig(initialConfig.apiUrl);
  if (!apiResponse) {
    return null;
  }

  return mapApiResponseToWidgetConfig(apiResponse, initialConfig);
}
