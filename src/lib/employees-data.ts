import { Employee } from '../types';

// Временные тестовые данные специалистов
// В будущем здесь будет запрос к API для получения специалистов
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
];

/**
 * Получение списка специалистов
 * TODO: В будущем здесь будет запрос к API
 * @param branchId - ID филиала
 * @returns Promise<Employee[]> - список специалистов
 */
export async function getEmployees(branchId: number): Promise<Employee[]> {
  // Временная реализация - возвращаем моковые данные
  // В будущем здесь будет запрос к API:
  // const response = await fetch(`${apiUrl}/branches/${branchId}/employees`);
  // return await response.json();
  
  return Promise.resolve(MOCK_EMPLOYEES);
}

/**
 * Синхронное получение списка специалистов (для совместимости)
 * TODO: В будущем убрать, использовать только getEmployees()
 */
export function getEmployeesSync(branchId: number): Employee[] {
  return MOCK_EMPLOYEES;
}

