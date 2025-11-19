import { Employee } from '../../types';

/**
 * Утилиты для форматирования данных о сотрудниках
 */

/**
 * Форматирует ФИО сотрудника
 * @param employee - Объект сотрудника
 * @returns Полное ФИО в формате "Фамилия Имя Отчество"
 */
export function formatEmployeeFullName(employee: Employee | null): string {
  if (!employee) return '';

  return `${employee.lastName} ${employee.firstName} ${employee.patronymic || ''}`.trim();
}

/**
 * Форматирует ФИО сотрудника из отдельных полей
 * @param lastName - Фамилия
 * @param firstName - Имя
 * @param patronymic - Отчество (опционально)
 * @returns Полное ФИО в формате "Фамилия Имя Отчество"
 */
export function formatFullName(
  lastName: string,
  firstName: string,
  patronymic?: string,
): string {
  return `${lastName} ${firstName} ${patronymic || ''}`.trim();
}

