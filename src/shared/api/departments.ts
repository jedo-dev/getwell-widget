import { Department } from '../../types';
import { DepartmentsResponse } from '../types/api';
import { apiClient } from './instance';

/**
 * Моковые данные отделений
 */
const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 1,
    name: 'Анестезиология',
    showInWidget: true,
  },
  {
    id: 2,
    name: 'Визуальная диагностика',
    showInWidget: true,
  },
  {
    id: 3,
    name: 'Гастроэнтерология',
    showInWidget: true,
  },
  {
    id: 4,
    name: 'Гематология',
    showInWidget: true,
  },
  {
    id: 5,
    name: 'Дерматология',
    showInWidget: true,
  },
  {
    id: 6,
    name: 'Диетология',
    showInWidget: true,
  },
  {
    id: 7,
    name: 'Зоопсихология',
    showInWidget: true,
  },
  {
    id: 8,
    name: 'Инфекционное отделение',
    showInWidget: true,
  },
  {
    id: 9,
    name: 'Кардиология',
    showInWidget: true,
  },
  {
    id: 10,
    name: 'Неврология',
    showInWidget: true,
  },
  {
    id: 11,
    name: 'Нефрология',
    showInWidget: true,
  },
  {
    id: 12,
    name: 'Онкология',
    showInWidget: true,
  },
];

/**
 * API для работы с отделениями
 */
export const departmentsApi = {
  /**
   * Получить список отделений филиала
   */
  async getByBranch(branchId?: number): Promise<DepartmentsResponse> {
    // В реальной реализации:
    // const url = branchId ? `/branches/${branchId}/departments` : '/departments';
    // return await apiClient.get<DepartmentsResponse>(url);

    // Моковая реализация
    return {
      data: MOCK_DEPARTMENTS.filter((dept) => dept.showInWidget),
      success: true,
    };
  },

  /**
   * Получить отделение по ID
   */
  async getById(id: number): Promise<Department | null> {
    // В реальной реализации:
    // return await apiClient.get<Department>(`/departments/${id}`);

    // Моковая реализация
    const department = MOCK_DEPARTMENTS.find((d) => d.id === id);
    return department || null;
  },
};

