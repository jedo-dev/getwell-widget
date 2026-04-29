import { Branch, Department, Employee, WidgetConfig } from '../../types';
import { formatUtcToTenantHHmm } from '../lib/tenant-timezone';
import { resolveTheme } from '../utils/theme';
import { formatResidentialAddress } from './address';
import {
  EmployeeApiData,
  FileImage,
  FilialApiData,
  getWidgetSettings,
  WidgetSettingsApiResponse,
} from './widget-settings-cache';

/**
 * Преобразование расписания в читаемую строку
 */
function formatSchedule(
  schedules: Array<{ week_day: string; from: string; to: string; is_around_the_clock: boolean }>,
  timezone?: FilialApiData['timezone'],
): string {
  if (!schedules || schedules.length === 0) {
    return '';
  }

  const dayNames: Record<string, string> = {
    Monday: 'Пн',
    Tuesday: 'Вт',
    Wednesday: 'Ср',
    Thursday: 'Чт',
    Friday: 'Пт',
    Saturday: 'Сб',
    Sunday: 'Вс',
  };

  const scheduleMap = new Map<string, typeof schedules>();
  schedules.forEach((schedule) => {
    const dayName = dayNames[schedule.week_day] || schedule.week_day;
    if (!scheduleMap.has(dayName)) {
      scheduleMap.set(dayName, []);
    }
    scheduleMap.get(dayName)!.push(schedule);
  });

  const formatTime = (timeStr: string): string => formatUtcToTenantHHmm(timeStr, timezone);

  const scheduleParts: string[] = [];
  scheduleMap.forEach((daySchedules, dayName) => {
    if (daySchedules.length > 0) {
      const firstSchedule = daySchedules[0];
      if (firstSchedule.is_around_the_clock) {
        scheduleParts.push(`${dayName}: круглосуточно`);
      } else {
        const fromTime = formatTime(firstSchedule.from);
        const toTime = formatTime(firstSchedule.to);
        if (fromTime && toTime) {
          scheduleParts.push(`${dayName}: ${fromTime}-${toTime}`);
        }
      }
    }
  });

  return scheduleParts.join(', ');
}

/**
 * Преобразование филиала из API в Branch
 */
function mapFilialToBranch(filial: FilialApiData): Branch {
  return {
    id: filial.id,
    name: filial.name,
    address: formatResidentialAddress(filial.residential_address),
    phone: filial.phone_number || '',
    schedule: formatSchedule(filial.schedules || [], filial.timezone),
    timezone: filial.timezone,
  };
}

/**
 * Преобразование сотрудника из API в Employee
 */
function mapEmployeeApiToEmployee(employeeApi: EmployeeApiData): Employee {
  const position = employeeApi.job_position_for_documents?.name || '';

  return {
    id: employeeApi.id,
    firstName: employeeApi.name || '',
    lastName: employeeApi.surname || '',
    patronymic: employeeApi.patronymic || undefined,
    photo: employeeApi.photo || undefined,
    position: position,
    specialization: position,
    information: employeeApi.info || undefined,
    showInWidget: true,
  };
}

function resolveImageUrl(image: FileImage | string | null | undefined): string | undefined {
  if (!image) {
    return undefined;
  }

  if (typeof image === 'string') {
    return image;
  }

  return (
    image.original_link || image.webp_preview_link || image.jpeg_preview_link || image.download_link
  );
}

function normalizeStickyButtonPosition(
  positionOnSite?: string,
): NonNullable<WidgetConfig['stickyButtonPosition']> {
  return positionOnSite === 'left' || positionOnSite === 'bottom_left' ? 'left' : 'right';
}

/**
 * Преобразование данных из API в формат WidgetConfig
 */
function mapApiResponseToWidgetConfig(
  apiResponse: WidgetSettingsApiResponse,
  initialConfig: WidgetConfig,
): WidgetConfig {
  const { data } = apiResponse;
  const legalDocumentType = data.legal_documents?.type?.trim().toLowerCase();
  const legalDocumentValue = data.legal_documents?.value?.trim();
  const isExternalPolicyLink = legalDocumentType === 'link' && Boolean(legalDocumentValue);

  const resolvedStickyButtonTheme = resolveTheme({
    primaryColor:
      data.online_appointment_button?.decoration?.color ||
      data.widget_theme ||
      initialConfig.theme?.primaryColor,
  });

  const branches: Branch[] = Array.from(data.filials.values()).map(mapFilialToBranch);

  // Собираем все отделения
  const departmentsMap = new Map<number, Department>();
  (data.departments || []).forEach((dept) => {
    if (!departmentsMap.has(dept.id)) {
      departmentsMap.set(dept.id, {
        id: dept.id,
        name: dept.name,
        filialId: dept.filial.id,
        showInWidget: true,
      });
    }
  });
  const departments: Department[] = Array.from(departmentsMap.values());

  // Собираем всех сотрудников
  const employeesMap = new Map<number, Employee>();
  (data.employees || []).forEach((emp) => {
    if (!employeesMap.has(emp.id)) {
      employeesMap.set(emp.id, mapEmployeeApiToEmployee(emp));
    }
  });
  const employees: Employee[] = Array.from(employeesMap.values());

  // Формируем конфиг
  const config: WidgetConfig = {
    ...initialConfig,
    // Изображения
    logoUrl: data.logo_image?.original_link || undefined,
    desktopImageUrl: resolveImageUrl(data.image_pc),
    mobileImageUrl: resolveImageUrl(data.image_mobile),
    logo: data.logo_image?.original_link || undefined,

    // Тема
    theme: {
      ...initialConfig.theme,
      primaryColor: data.widget_theme || initialConfig.theme?.primaryColor || '#344054',
    },

    // Данные
    branches,
    departments,

    // Настройки отображения
    showDepartments: data.show_departments,
    showEmployeePosition: data.show_employee_position,
    showDoctorInfo: data.show_employee_info,

    // Яндекс карты
    yandexMapFrameCode: data.yandex_map_frame || undefined,

    // Политика конфиденциальности
    textPolicy: isExternalPolicyLink ? undefined : legalDocumentValue || undefined,
    linkToExternalPolicy: isExternalPolicyLink ? legalDocumentValue : undefined,
    isExternalLinkPolicy: isExternalPolicyLink,

    // Кнопка онлайн-записи
    stickyBtnEnable: data.online_appointment_button?.display_on_site || false,
    stickyButtonPulse: data.online_appointment_button?.decoration?.ripple_effect || false,
    stickyButtonColor: resolvedStickyButtonTheme.primaryColor,
    stickyButtonPosition: normalizeStickyButtonPosition(
      data.online_appointment_button?.decoration?.position_on_site,
    ),
  };

  return config;
}

/**
 * API для работы с конфигурацией виджета
 */
export const widgetConfigApi = {
  /**
   * Получить конфигурацию виджета
   */
  async getConfig(apiUrl?: string): Promise<WidgetSettingsApiResponse | null> {
    try {
      const response = await getWidgetSettings(apiUrl);
      return response;
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
  if (!apiResponse || apiResponse.status !== 'ok') {
    return null;
  }

  return mapApiResponseToWidgetConfig(apiResponse, initialConfig);
}
