import { Pet } from '../../types';
import { PetsResponse } from '../types/api';
import { apiClient } from './instance';

/**
 * Моковые данные питомцев
 */
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
 * API для работы с питомцами
 */
export const petsApi = {
  /**
   * Получить список питомцев клиента по телефону
   */
  async getByPhone(phone: string): Promise<PetsResponse> {
    // В реальной реализации:
    // return await apiClient.get<PetsResponse>(`/pets?phone=${phone}`);

    // Моковая реализация
    return {
      data: MOCK_PETS,
      success: true,
    };
  },

  /**
   * Получить питомца по ID
   */
  async getById(id: number): Promise<Pet | null> {
    // В реальной реализации:
    // return await apiClient.get<Pet>(`/pets/${id}`);

    // Моковая реализация
    const pet = MOCK_PETS.find((p) => p.id === id);
    return pet || null;
  },

  /**
   * Создать нового питомца
   */
  async create(pet: Omit<Pet, 'id'>, clientId: number): Promise<Pet> {
    // В реальной реализации:
    // return await apiClient.post<Pet>(`/clients/${clientId}/pets`, pet);

    // Моковая реализация
    const newPet: Pet = {
      ...pet,
      id: Date.now(),
    };
    MOCK_PETS.push(newPet);
    return newPet;
  },

  /**
   * Обновить питомца
   */
  async update(id: number, pet: Partial<Pet>): Promise<Pet> {
    // В реальной реализации:
    // return await apiClient.put<Pet>(`/pets/${id}`, pet);

    // Моковая реализация
    const index = MOCK_PETS.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Pet with id ${id} not found`);
    }
    const updatedPet = { ...MOCK_PETS[index], ...pet };
    MOCK_PETS[index] = updatedPet;
    return updatedPet;
  },
};

