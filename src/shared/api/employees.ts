import { Employee } from '../../types';
import { EmployeesResponse } from '../types/api';
import { EmployeeApiData, getWidgetSettings } from './widget-settings-cache';

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
 * Преобразование данных сотрудника из API в формат приложения
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

/**
 * API для работы с сотрудниками
 */
export const employeesApi = {
  /**
   * Получить список всех сотрудников
   */
  async getAll(): Promise<EmployeesResponse> {
    try {
      const settings = await getWidgetSettings();
      if (settings.status !== 'ok') {
        return {
          data: [],
          success: false,
          message: settings.reason || 'Failed to fetch employees',
        };
      }

      const employees: Employee[] = (settings.data.employees || []).map(mapEmployeeApiToEmployee);

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
    try {
      const settings = await getWidgetSettings();
      if (settings.status !== 'ok') {
        return {
          data: [],
          success: false,
          message: settings.reason || 'Failed to fetch employees',
        };
      }

      // Фильтруем сотрудников по филиалу через отделения
      const departmentsForBranch = (settings.data.departments || []).filter(
        (dept) => dept.filial.id === branchId,
      );

      // Собираем всех сотрудников из отделений филиала
      // В текущей структуре API сотрудники не привязаны напрямую к отделениям в ответе,
      // поэтому возвращаем всех сотрудников
      const employees: Employee[] = (settings.data.employees || []).map(mapEmployeeApiToEmployee);

      return {
        data: employees,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching employees by branch:', error);
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
   * Получить список сотрудников отделения
   */
  async getByDepartment(branchId: number, departmentId: number): Promise<EmployeesResponse> {
    try {
      const settings = await getWidgetSettings();
      if (settings.status !== 'ok') {
        return {
          data: [],
          success: false,
          message: settings.reason || 'Failed to fetch employees',
        };
      }

      // Проверяем, что отделение принадлежит указанному филиалу
      const department = (settings.data.departments || []).find(
        (dept) => dept.id === departmentId && dept.filial.id === branchId,
      );

      if (!department) {
        return {
          data: [],
          success: false,
          message: 'Department not found',
        };
      }

      // В текущей структуре API сотрудники не привязаны напрямую к отделениям в ответе,
      // поэтому возвращаем всех сотрудников
      const employees: Employee[] = (settings.data.employees || []).map(mapEmployeeApiToEmployee);

      return {
        data: employees,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching employees by department:', error);
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
   * Получить сотрудника по ID
   */
  async getById(id: number): Promise<Employee | null> {
    try {
      const settings = await getWidgetSettings();
      if (settings.status !== 'ok') {
        return null;
      }

      const employeeData = (settings.data.employees || []).find((emp) => emp.id === id);
      if (!employeeData) {
        return null;
      }

      return mapEmployeeApiToEmployee(employeeData);
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      return null;
    }
  },
};
