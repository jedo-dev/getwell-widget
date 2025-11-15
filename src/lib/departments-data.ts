import { Department } from '../types';

// Временные тестовые данные отделений
// В будущем здесь будет запрос к API для получения отделений
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
 * Получение списка отделений
 * TODO: В будущем здесь будет запрос к API
 * @param branchId - ID филиала (опционально)
 * @returns Promise<Department[]> - список отделений
 */
export async function getDepartments(branchId?: number): Promise<Department[]> {
  // Временная реализация - возвращаем моковые данные
  // В будущем здесь будет запрос к API:
  // const response = await fetch(`${apiUrl}/branches/${branchId}/departments`);
  // return await response.json();
  
  return Promise.resolve(MOCK_DEPARTMENTS.filter(dept => dept.showInWidget));
}

/**
 * Синхронное получение списка отделений (для совместимости)
 * TODO: В будущем убрать, использовать только getDepartments()
 */
export function getDepartmentsSync(branchId?: number): Department[] {
  return MOCK_DEPARTMENTS.filter(dept => dept.showInWidget);
}

