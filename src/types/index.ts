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


  // Основные цвета
  primaryColor?: string; // Основной цвет (#344054)
  secondaryColor?: string; // Вторичный цвет (#52c41a)
  backgroundColor?: string; // Фоновый цвет (#ffffff)
  backgroundSecondary?: string; // Вторичный фон (#f5f5f5)
  backgroundTertiary?: string; // Третичный фон (#fafafa)

  // Цвета текста
  textColor?: string; // Основной текст (#101828)
  textSecondary?: string; // Вторичный текст (#344054)
  textTertiary?: string; // Третичный текст (#777777)
  textDisabled?: string; // Отключенный текст (#c9c9c9)

  // Цвета границ
  borderColor?: string; // Основная граница (#f0f0f0)
  borderSecondary?: string; // Вторичная граница (#eaecf0)
  borderTertiary?: string; // Третичная граница (#d0d5dd)

  // Цвета состояний
  errorColor?: string; // Цвет ошибки (#ff4d4f)
  successColor?: string; // Цвет успеха (#52c41a)
  linkColor?: string; // Цвет ссылки (#1890ff)
  linkHoverColor?: string; // Цвет ссылки при наведении (#40a9ff)

  // Цвета кнопок
  buttonPrimary?: string; // Основная кнопка (#344054)
  buttonPrimaryHover?: string; // Основная кнопка при наведении (#1f2937)
  buttonSecondary?: string; // Вторичная кнопка (#d0d5dd)
  buttonText?: string; // Текст кнопки (#ffffff)

  // Дополнительные цвета
  scrollbarColor?: string; // Цвет скроллбара (#344054)
  tagBackground?: string; // Фон тега (#1c29360d)
}

// Widget Config (Настройки виджета)
export interface WidgetConfig {
  theme?: WidgetTheme;
  logo?: string; // URL логотипа
  logoUrl?: string; // URL логотипа (строка)
  desktopImageUrl?: string; // URL изображения для ПК (строка)
  mobileImageUrl?: string; // URL изображения для мобильного устройства (строка)
  yandexMapFrameCode?: string; // код фрейма Яндекс карт (строка)
  apiUrl?: string; // URL API для получения данных
  offlineMode?: boolean; // Режим без запросов к API, данные берём из конфига

  render?: {
    currentStep?: WidgetStep; // Принудительно отрисовать указанный шаг (для предпросмотра)
    lockStep?: boolean; // Зафиксировать шаг и запретить навигацию
    preserveStepOnOpen?: boolean; // Не сбрасывать шаг при open()
  };
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
  stickyButtonPulse?: boolean; // включить/выключить пульсацию кнопки
  stickyButtonPosition?: 'left' | 'right'; // расположение кнопки (лево/право)
  stickyButtonColor?: string; // цвет кнопки (hex формат, например #F3F4F8)
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
  /**
   * Выбранный временной слот.
   * `selectedTimeSlot` хранит время начала (from) в ISO-формате (для UI и Date()).
   * `selectedTimeSlotTo` хранит время окончания (to) в ISO-формате.
   */
  selectedTimeSlot: string | null;
  selectedTimeSlotTo: string | null;
  phone: string | null;
  selectedPetId: number | null;
  isNewUser?: boolean; // новый пользователь
  clientData?: {
    firstName?: string;
    lastName?: string;
    patronymic?: string;
    gender?: Gender;
  };
  ownerData?: {
    id: number;
    surname: string;
    name: string;
    patronymic: string;
    gender: 'male' | 'female';
    phone_number: string;
    patients: Array<{
      id: number;
      nickname: string;
      gender: { id: number; name: string };
      breed: {
        id: number;
        name: string;
        patient_type: {
          id: number;
          name: string;
          breeds_count: number;
          created_at: string;
          deleted_at: string | null;
          deleted_by: number | null;
        };
        deleted_at: string | null;
        deleted_by: number | null;
      };
      birth_date: string;
      owner: number | null;
    }>;
  };
}

// Экспортируем enum'ы для удобства
export { AppointmentType, Gender, PetSpecies, SelectionMode, WidgetStep };

