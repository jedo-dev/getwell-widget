import { Appointment, Branch, Client, Department, Employee, Pet, TimeSlot } from '../../types';
import { AppointmentType } from '../constants/appointment-types';
import { Gender } from '../constants/gender';
import { PetSpecies } from '../constants/pet-species';

/**
 * Базовый тип для API ответов
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Тип для ошибок API
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Типы для запросов API
 */

// Запрос на создание записи
export interface CreateAppointmentRequest {
  branchId: number;
  employeeId?: number;
  departmentId?: number;
  client: Omit<Client, 'id'>;
  pet: Omit<Pet, 'id'>;
  timeSlot: {
    datetime: string;
    duration: number;
    appointmentType: AppointmentType;
  };
  notes?: string;
}

// Запрос на получение слотов времени
export interface GetTimeSlotsRequest {
  branchId: number;
  employeeId?: number;
  departmentId?: number;
  date: string; // ISO date string
}

// Запрос на поиск клиента по телефону
export interface FindClientByPhoneRequest {
  phone: string;
}

// Запрос на создание клиента
export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  patronymic?: string;
  phone: string;
  email?: string;
  gender?: Gender;
}

// Запрос на создание питомца
export interface CreatePetRequest {
  name: string;
  species?: PetSpecies | string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: Gender;
  birthDate?: string;
  clientId: number;
}

/**
 * Типы для ответов API
 */

// Ответ со списком филиалов
export type BranchesResponse = ApiResponse<Branch[]>;

// Ответ со списком сотрудников
export type EmployeesResponse = ApiResponse<Employee[]>;

// Ответ со списком отделений
export type DepartmentsResponse = ApiResponse<Department[]>;

// Ответ со списком питомцев
export type PetsResponse = ApiResponse<Pet[]>;

// Ответ со списком слотов времени
export type TimeSlotsResponse = ApiResponse<TimeSlot[]>;

// Ответ с информацией о клиенте
export type ClientResponse = ApiResponse<Client | null>;

// Ответ с созданной записью
export type AppointmentResponse = ApiResponse<Appointment>;

/**
 * Типы для форм
 */

// Данные формы записи
export interface AppointmentFormData {
  branchId: number;
  employeeId?: number;
  departmentId?: number;
  phone: string;
  isNewUser: boolean;
  clientData?: {
    firstName: string;
    lastName: string;
    patronymic: string;
    gender: string;
  };
  petId?: number;
  petData?: {
    name: string;
    species: string;
    breed: string;
    gender: string;
    birthDate: string;
  };
  timeSlot: string; // ISO datetime string
  symptoms?: string;
  consentPersonalData: boolean;
  consentMarketing: boolean;
}
