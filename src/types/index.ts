import { AppointmentType } from '../shared/constants/appointment-types';
import { Gender } from '../shared/constants/gender';
import { PetSpecies } from '../shared/constants/pet-species';
import { SelectionMode } from '../shared/constants/selection-modes';
import { WidgetStep } from '../shared/constants/widget-steps';

// Branch (Филиал)
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  schedule: string;
}

// Employee (Врач)
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  patronymic?: string;
  photo?: string;
  position: string;
  specialization: string;
  information?: string; // информация о враче
  showInWidget: boolean;
}

// Department (Отделение)
export interface Department {
  id: number;
  name: string;
  showInWidget: boolean;
}

// TimeSlot (Слот времени)
export interface TimeSlot {
  datetime: string; // ISO string
  duration: number; // длительность в минутах
  appointmentType: AppointmentType; // тип приёма
}

// Pet (Питомец)
export interface Pet {
  id?: number;
  name: string;
  species?: PetSpecies | string; // вид животного (для обратной совместимости оставляем string)
  breed?: string; // порода
  age?: number;
  weight?: number;
  gender?: Gender; // пол питомца
  birthDate?: string; // дата рождения в формате ISO
}

// Client (Клиент)
export interface Client {
  id?: number;
  firstName: string;
  lastName: string;
  patronymic?: string;
  phone: string;
  email?: string;
  gender?: Gender;
}

// Appointment (Запись)
export interface Appointment {
  branchId: number;
  employeeId?: number;
  departmentId?: number;
  client: Client;
  pet: Pet;
  timeSlot: TimeSlot;
  notes?: string;
  appointmentType: AppointmentType;
}

// Widget Theme
export interface WidgetTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

// Widget Config (Настройки виджета)
export interface WidgetConfig {
  theme?: WidgetTheme;
  logo?: string; // URL логотипа
  apiUrl?: string; // URL API для получения данных
  branches?: Branch[];
  employees?: Employee[];
  departments?: Department[];
  defaultBranchId?: number;
  showBranches?: boolean;
  showEmployees?: boolean;
  showDepartments?: boolean;
  showDoctorInfo?: boolean; // отображать информацию о врачах
  showEmployeePosition?: boolean; // отображать должности/специализации врачей
  stickyBtnEnable?: boolean; // включить плавающую кнопку
  isNeedToBlankOpen?: boolean; // открывать в новом окне вместо Drawer
  renderedAsPage?: boolean; // отрисовать виджет как страницу
  isExternalLinkPolicy?: boolean; // открывать политику по внешней ссылке
  textPolicy?: string; // текст политики конфиденциальности
  linkToExternalPolicy?: string; // ссылка на внешнюю политику конфиденциальности
}

// Widget State
export interface WidgetState {
  isOpen: boolean;
  config: WidgetConfig | null;
  initialized: boolean;
  currentStep: WidgetStep;
  selectedBranchId: number | null;
  selectedEmployeeId: number | null;
  selectedDepartmentId: number | null;
  selectionMode?: SelectionMode; // режим выбора: специалист или отделение
  selectedTimeSlot: string | null;
  phone: string | null;
  selectedPetId: number | null;
  isNewUser?: boolean; // новый пользователь
  clientData?: {
    firstName?: string;
    lastName?: string;
    patronymic?: string;
    gender?: Gender;
  };
}

// Экспортируем enum'ы для удобства
export { AppointmentType, Gender, PetSpecies, SelectionMode, WidgetStep };
