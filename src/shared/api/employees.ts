import { Employee } from '../../types';
import { EmployeesResponse } from '../types/api';
import { apiClient, RequestParams } from './instance';

/**
 * Интерфейс должности из API
 */
interface JobPosition {
  id: number;
  name: string;
  has_employees: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: number | null;
}

/**
 * Интерфейс типа пользователя из API
 */
interface UserType {
  id: number;
  name: string;
  has_access: boolean;
}

/**
 * Интерфейс сотрудника из API
 */
interface EmployeeApiData {
  id: number;
  email: string;
  login: string;
  roles: unknown[];
  is_owner_tenant: boolean;
  photo: string | null;
  surname: string;
  name: string;
  patronymic: string | null;
  birth_date: string | null;
  phone_number: string | null;
  date_of_employment: string | null;
  date_of_dismissal: string | null;
  job_position_id_to_sign_documents: number | null;
  user_type: UserType | null;
  info: string | null;
  profiles: unknown[];
  job_position: JobPosition[];
  departments: unknown[];
  employee_group: unknown;
  warehouses: unknown[];
  sessions: unknown[];
  deleted_at: string | null;
  deleted_by: number | null;
}

/**
 * Интерфейс ответа API для списка сотрудников
 */
interface EmployeesApiResponse {
  status: string;
  reason: string | null;
  data: EmployeeApiData[];
  meta: {
    per_page: number;
    current_page: number;
    last_page: number;
    total: number;
    from: number;
  };
  validation_errors: Record<string, unknown>;
}

/**
 * Преобразование данных сотрудника из API в формат приложения
 */
function mapEmployeeApiToEmployee(employeeApi: EmployeeApiData): Employee {
  // Получаем должность из первого элемента массива job_position
  const position = employeeApi.job_position?.[0]?.name || '';

  return {
    id: employeeApi.id,
    firstName: employeeApi.name || '',
    lastName: employeeApi.surname || '',
    patronymic: employeeApi.patronymic || undefined,
    photo: employeeApi.photo || undefined,
    position: position,
    specialization: position, // Используем должность как специализацию
    information: employeeApi.info || undefined,
    showInWidget: true, // По умолчанию показываем в виджете
  };
}

/**
 * API для работы с сотрудниками
 */
export const employeesApi = {
  /**
   * Получить список всех сотрудников
   * @param params - Параметры запроса (page, per_page и т.д.)
   */
  async getAll(params?: { page?: number; per_page?: number }): Promise<EmployeesResponse> {
    try {
      const requestParams: RequestParams = {
        page: params?.page || 1,
        per_page: params?.per_page || 20,
      };

      const response = await apiClient.get<EmployeesApiResponse>(
        '/tenant/catalogues/employees',
        requestParams,
      );

      // Проверяем статус ответа
      if (response.status !== 'ok') {
        return {
          data: [],
          success: false,
          message: response.reason || 'Failed to fetch employees',
        };
      }

      // Преобразуем данные из формата API в формат приложения
      const employees: Employee[] = (response.data || []).map(mapEmployeeApiToEmployee);

      return {
        data: employees,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching employees:', error);
      return {
        data: [],
        success: false,
        message:
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'Failed to fetch employees',
      };
    }
  },

  /**
   * Получить список сотрудников филиала
   */
  async getByBranch(branchId: number): Promise<EmployeesResponse> {
    // В реальной реализации:
    // return await apiClient.get<EmployeesResponse>(`/branches/${branchId}/employees`);

    // Временно используем getAll с фильтрацией
    const response = await this.getAll();
    // TODO: Добавить фильтрацию по branchId когда API будет поддерживать
    return response;
  },

  /**
   * Получить список сотрудников отделения
   */
  async getByDepartment(
    branchId: number,
    departmentId: number,
  ): Promise<EmployeesResponse> {
    // В реальной реализации:
    // return await apiClient.get<EmployeesResponse>(
    //   `/branches/${branchId}/departments/${departmentId}/employees`
    // );

    // Временно используем getAll с фильтрацией
    const response = await this.getAll();
    // TODO: Добавить фильтрацию по departmentId когда API будет поддерживать
    return response;
  },

  /**
   * Получить сотрудника по ID
   */
  async getById(id: number): Promise<Employee | null> {
    try {
      const response = await apiClient.get<{
        status: string;
        reason: string | null;
        data: EmployeeApiData;
        validation_errors: Record<string, unknown>;
      }>(`/tenant/catalogues/employees/${id}`);

      // Проверяем статус ответа
      if (response.status !== 'ok' || !response.data) {
        return null;
      }

      return mapEmployeeApiToEmployee(response.data);
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      return null;
    }
  },
};

