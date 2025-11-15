import { Branch } from '../types';

// Временные тестовые данные филиалов
// В будущем здесь будет запрос к API для получения филиалов
const MOCK_BRANCHES: Branch[] = [
  {
    id: 1,
    name: 'VetUnion профсоюзная',
    address: 'г. Москва, Профсоюзная улица 45',
    phone: '+7 (495) 123-45-67',
    schedule: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00',
  },
  {
    id: 2,
    name: 'VetUnion вернадского',
    address: 'г. Москва, Проспект Вернадского 39, 2 этаж',
    phone: '+7 (495) 234-56-78',
    schedule: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00',
  },
  {
    id: 3,
    name: 'VetUnion мневники',
    address: 'г. Москва, улица Мневники 21',
    phone: '+7 (495) 345-67-89',
    schedule: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00',
  },
];

/**
 * Получение списка филиалов
 * TODO: В будущем здесь будет запрос к API
 * @returns Promise<Branch[]> - список филиалов
 */
export async function getBranches(): Promise<Branch[]> {
  // Временная реализация - возвращаем моковые данные
  // В будущем здесь будет запрос к API:
  // const response = await fetch(`${apiUrl}/branches`);
  // return await response.json();
  
  return Promise.resolve(MOCK_BRANCHES);
}

/**
 * Синхронное получение списка филиалов (для совместимости)
 * TODO: В будущем убрать, использовать только getBranches()
 */
export function getBranchesSync(): Branch[] {
  return MOCK_BRANCHES;
}

