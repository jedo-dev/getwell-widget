import { Pet } from '../types';

// Временные тестовые данные питомцев
// В будущем здесь будет запрос к API для получения питомцев
const MOCK_PETS: Pet[] = [
  {
    id: 1,
    name: 'Тюбик',
    species: 'Собака',
    breed: 'Лабрадор',
    age: 3,
    weight: 25,
  },
  {
    id: 2,
    name: 'Мурка',
    species: 'Кошка',
    breed: 'Британская',
    age: 2,
    weight: 4,
  },
];

/**
 * Получение списка питомцев
 * TODO: В будущем здесь будет запрос к API
 * @param phone - Номер телефона клиента
 * @returns Promise<Pet[]> - список питомцев
 */
export async function getPets(phone: string): Promise<Pet[]> {
  // Временная реализация - возвращаем моковые данные
  // В будущем здесь будет запрос к API:
  // const response = await fetch(`${apiUrl}/pets?phone=${phone}`);
  // return await response.json();
  
  return Promise.resolve(MOCK_PETS);
}

/**
 * Синхронное получение списка питомцев (для совместимости)
 * TODO: В будущем убрать, использовать только getPets()
 */
export function getPetsSync(phone: string): Pet[] {
  return MOCK_PETS;
}

