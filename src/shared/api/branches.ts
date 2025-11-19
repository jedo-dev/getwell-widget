import { Branch } from '../../types';
import { BranchesResponse } from '../types/api';
import { apiClient } from './instance';

/**
 * Моковые данные филиалов
 */
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
 * API для работы с филиалами
 */
export const branchesApi = {
  /**
   * Получить список всех филиалов
   */
  async getAll(): Promise<BranchesResponse> {
    // В реальной реализации:
    // return await apiClient.get<BranchesResponse>('/branches');

    // Моковая реализация
    return {
      data: MOCK_BRANCHES,
      success: true,
    };
  },

  /**
   * Получить филиал по ID
   */
  async getById(id: number): Promise<Branch | null> {
    // В реальной реализации:
    // return await apiClient.get<Branch>(`/branches/${id}`);

    // Моковая реализация
    const branch = MOCK_BRANCHES.find((b) => b.id === id);
    return branch || null;
  },
};

