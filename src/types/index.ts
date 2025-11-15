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
  appointmentType: 'consultation' | 'examination' | 'procedure' | 'other'; // тип приёма
}

// Pet (Питомец)
export interface Pet {
  id?: number;
  name: string;
  species?: string; // вид животного
  breed?: string; // порода
  age?: number;
  weight?: number;
}

// Client (Клиент)
export interface Client {
  id?: number;
  firstName: string;
  lastName: string;
  patronymic?: string;
  phone: string;
  email?: string;
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
  appointmentType: 'consultation' | 'examination' | 'procedure' | 'other';
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
}

// Widget Step (Шаг виджета)
export type WidgetStep = 'branch-selection' | 'next-steps' | 'specialist-selection' | 'department-specialists-selection' | 'doctor-info' | 'date-time-selection' | 'phone-input' | 'appointment-details' | 'appointment-confirmation';

// Widget State
export interface WidgetState {
  isOpen: boolean;
  config: WidgetConfig | null;
  initialized: boolean;
  currentStep: WidgetStep;
  selectedBranchId: number | null;
  selectedEmployeeId: number | null;
  selectedDepartmentId: number | null;
  selectionMode?: 'employee' | 'department'; // режим выбора: специалист или отделение
  selectedTimeSlot: string | null;
  phone: string | null;
  selectedPetId: number | null;
  isNewUser?: boolean; // новый пользователь
  clientData?: {
    firstName?: string;
    lastName?: string;
    patronymic?: string;
    gender?: 'male' | 'female';
  };
}

