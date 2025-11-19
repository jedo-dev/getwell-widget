import { Client } from '../../types';
import { ClientResponse, CreateClientRequest } from '../types/api';

/**
 * Моковые данные клиентов
 */
const MOCK_CLIENTS: Client[] = [
  {
    id: 1,
    firstName: 'Иван',
    lastName: 'Иванов',
    patronymic: 'Иванович',
    phone: '+7 999 123 45 67',
    email: 'ivan@example.com',
  },
];

/**
 * API для работы с клиентами
 */
export const clientsApi = {
  /**
   * Найти клиента по телефону
   */
  async findByPhone(phone: string): Promise<ClientResponse> {
    // В реальной реализации:
    // return await apiClient.get<ClientResponse>(`/clients?phone=${phone}`);

    // Моковая реализация
    const client = MOCK_CLIENTS.find(
      (c) => c.phone.replace(/[^\d]/g, '') === phone.replace(/[^\d]/g, ''),
    );
    return {
      data: client || null,
      success: true,
    };
  },

  /**
   * Создать нового клиента
   */
  async create(clientData: CreateClientRequest): Promise<Client> {
    // В реальной реализации:
    // return await apiClient.post<Client>('/clients', clientData);

    // Моковая реализация
    const newClient: Client = {
      ...clientData,
      id: Date.now(),
    };
    MOCK_CLIENTS.push(newClient);
    return newClient;
  },

  /**
   * Обновить клиента
   */
  async update(id: number, clientData: Partial<Client>): Promise<Client> {
    // В реальной реализации:
    // return await apiClient.put<Client>(`/clients/${id}`, clientData);

    // Моковая реализация
    const index = MOCK_CLIENTS.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Client with id ${id} not found`);
    }
    const updatedClient = { ...MOCK_CLIENTS[index], ...clientData };
    MOCK_CLIENTS[index] = updatedClient;
    return updatedClient;
  },
};
