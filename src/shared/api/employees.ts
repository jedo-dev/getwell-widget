import { Employee } from '../../types';
import { EmployeesResponse } from '../types/api';
import { apiClient } from './instance';

/**
 * Моковые данные сотрудников
 */
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    firstName: 'Наталья',
    lastName: 'Алексеева',
    patronymic: 'Петровна',
    position: 'Врач-терапевт',
    specialization: 'Врач-терапевт',
    showInWidget: true,
  },
  {
    id: 2,
    firstName: 'Наталья',
    lastName: 'Алексеева',
    patronymic: 'Петровна',
    position: 'Врач-дерматолог',
    specialization: 'Врач-дерматолог',
    showInWidget: true,
  },
  {
    id: 3,
    firstName: 'Наталья',
    lastName: 'Алексеева',
    patronymic: 'Петровна',
    position: 'Врач-диетолог',
    specialization: 'Врач-диетолог',
    showInWidget: true,
  },
  {
    id: 4,
    firstName: 'Наталья',
    lastName: 'Алексеева',
    patronymic: 'Петровна',
    position: 'Врач-невролог',
    specialization: 'Врач-невролог',
    showInWidget: true,
  },
  {
    id: 5,
    firstName: 'Иван',
    lastName: 'Иванов',
    patronymic: 'Иванович',
    position: 'Врач-кардиолог',
    specialization: 'Врач-кардиолог',
    showInWidget: true,
  },
  {
    id: 6,
    firstName: 'Петр',
    lastName: 'Петров',
    patronymic: 'Петрович',
    position: 'Врач-эндокринолог',
    specialization: 'Врач-эндокринолог',
    showInWidget: true,
  },
  {
    id: 7,
    firstName: 'Сергей',
    lastName: 'Сергеев',
    patronymic: 'Сергеевич',
    position: 'Врач-гастроэнтеролог',
    specialization: 'Врач-гастроэнтеролог',
    showInWidget: true,
  },
  {
    id: 8,
    firstName: 'Дмитрий',
    lastName: 'Дмитриев',
    patronymic: 'Дмитриевич',
    position: 'Врач-гематолог',
    specialization: 'Врач-гематолог',
    showInWidget: true,
  },
];

/**
 * API для работы с сотрудниками
 */
export const employeesApi = {
  /**
   * Получить список сотрудников филиала
   */
  async getByBranch(branchId: number): Promise<EmployeesResponse> {
    // В реальной реализации:
    // return await apiClient.get<EmployeesResponse>(`/branches/${branchId}/employees`);

    // Моковая реализация
    return {
      data: MOCK_EMPLOYEES,
      success: true,
    };
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

    // Моковая реализация
    return {
      data: MOCK_EMPLOYEES,
      success: true,
    };
  },

  /**
   * Получить сотрудника по ID
   */
  async getById(id: number): Promise<Employee | null> {
    // В реальной реализации:
    // return await apiClient.get<Employee>(`/employees/${id}`);

    // Моковая реализация
    const employee = MOCK_EMPLOYEES.find((e) => e.id === id);
    return employee || null;
  },
};

