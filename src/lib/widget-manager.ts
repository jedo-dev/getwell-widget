import { WidgetConfig, WidgetState } from '../types';

// Глобальное состояние виджета
let widgetState: WidgetState = {
  isOpen: false,
  config: null,
  initialized: false,
  currentStep: 'branch-selection',
  selectedBranchId: null,
  selectedEmployeeId: null,
  selectedDepartmentId: null,
  selectedTimeSlot: null,
  phone: null,
  selectedPetId: null,
};

// Callbacks для уведомления компонентов об изменении состояния
let stateChangeCallbacks: Array<(state: WidgetState) => void> = [];

// Функция для подписки на изменения состояния
export function subscribeToStateChange(callback: (state: WidgetState) => void): () => void {
  stateChangeCallbacks.push(callback);

  // Возвращаем функцию отписки
  return () => {
    stateChangeCallbacks = stateChangeCallbacks.filter((cb) => cb !== callback);
  };
}

// Функция для уведомления всех подписчиков об изменении состояния
function notifyStateChange() {
  stateChangeCallbacks.forEach((callback) => callback(widgetState));
}

// Функция для получения текущего состояния
export function getWidgetState(): WidgetState {
  return { ...widgetState };
}

/**
 * Инициализация виджета с конфигурацией
 * @param config - Конфигурация виджета
 */
export function initGetWellWidget(config: WidgetConfig): void {
  widgetState = {
    ...widgetState,
    config: {
      ...config,
      // Применяем дефолтные значения
      showBranches: config.showBranches ?? true,
      showEmployees: config.showEmployees ?? true,
      showDepartments: config.showDepartments ?? true,
    },
    initialized: true,
  };

  notifyStateChange();
}

/**
 * Открытие виджета
 */
export function openGetWellWidget(): void {
  if (!widgetState.initialized) {
    console.warn('GetWell Widget: Widget is not initialized. Call initGetWellWidget() first.');
    return;
  }

  widgetState = {
    ...widgetState,
    isOpen: true,
    currentStep: 'branch-selection',
    selectedBranchId: null,
    selectedEmployeeId: null,
    selectedDepartmentId: null,
    selectionMode: undefined,
    selectedTimeSlot: null,
    phone: null,
    selectedPetId: null,
  };

  notifyStateChange();
}

/**
 * Закрытие виджета
 */
export function closeGetWellWidget(): void {
  widgetState = {
    ...widgetState,
    isOpen: false,
  };

  notifyStateChange();
}

/**
 * Сброс состояния виджета (для тестирования или переинициализации)
 */
export function resetGetWellWidget(): void {
  widgetState = {
    isOpen: false,
    config: null,
    initialized: false,
    currentStep: 'branch-selection',
    selectedBranchId: null,
    selectedEmployeeId: null,
    selectedDepartmentId: null,
    selectionMode: undefined,
    selectedTimeSlot: null,
    phone: null,
    selectedPetId: null,
  };

  notifyStateChange();
}

/**
 * Установка выбранного филиала и переход к следующему шагу
 */
export function selectBranch(branchId: number): void {
  widgetState = {
    ...widgetState,
    selectedBranchId: branchId,
    currentStep: 'next-steps',
  };

  notifyStateChange();
}

/**
 * Переход к выбору специалиста
 */
export function goToSpecialistSelection(): void {
  widgetState = {
    ...widgetState,
    currentStep: 'specialist-selection',
    selectionMode: 'employee',
  };

  notifyStateChange();
}

/**
 * Переход к выбору отделения
 */
export function goToDepartmentSelection(): void {
  widgetState = {
    ...widgetState,
    currentStep: 'specialist-selection',
    selectionMode: 'department',
  };

  notifyStateChange();
}

/**
 * Выбор специалиста
 */
export function selectEmployee(employeeId: number): void {
  widgetState = {
    ...widgetState,
    selectedEmployeeId: employeeId,
  };

  notifyStateChange();
}

/**
 * Выбор отделения и переход к списку врачей отделения
 */
export function selectDepartment(departmentId: number): void {
  widgetState = {
    ...widgetState,
    selectedDepartmentId: departmentId,
    currentStep: 'department-specialists-selection',
  };

  notifyStateChange();
}

/**
 * Переход к списку врачей отделения
 */
export function goToDepartmentSpecialistsSelection(): void {
  widgetState = {
    ...widgetState,
    currentStep: 'department-specialists-selection',
  };

  notifyStateChange();
}

/**
 * Переход к выбору даты и времени
 */
export function goToDateTimeSelection(): void {
  widgetState = {
    ...widgetState,
    currentStep: 'date-time-selection',
  };

  notifyStateChange();
}

/**
 * Выбор даты и времени
 */
export function selectDateTime(dateTime: string): void {
  widgetState = {
    ...widgetState,
    selectedTimeSlot: dateTime,
  };

  notifyStateChange();
}

/**
 * Переход к вводу телефона
 */
export function goToPhoneInput(): void {
  widgetState = {
    ...widgetState,
    currentStep: 'phone-input',
  };

  notifyStateChange();
}

/**
 * Сохранение телефона и переход к деталям записи
 */
export function savePhoneAndGoToDetails(phone: string, isNewUser: boolean = false): void {
  widgetState = {
    ...widgetState,
    phone,
    isNewUser,
    currentStep: 'appointment-details',
  };

  notifyStateChange();
}

/**
 * Переход к деталям записи
 */
export function goToAppointmentDetails(): void {
  widgetState = {
    ...widgetState,
    currentStep: 'appointment-details',
  };

  notifyStateChange();
}

/**
 * Сохранение выбранного питомца
 */
export function selectPet(petId: number): void {
  widgetState = {
    ...widgetState,
    selectedPetId: petId,
  };

  notifyStateChange();
}

/**
 * Переход к подтверждению записи
 */
export function goToAppointmentConfirmation(): void {
  widgetState = {
    ...widgetState,
    currentStep: 'appointment-confirmation',
  };

  notifyStateChange();
}

/**
 * Переход к экрану информации о враче
 */
export function goToDoctorInfo(): void {
  widgetState = {
    ...widgetState,
    currentStep: 'doctor-info',
  };

  notifyStateChange();
}

/**
 * Возврат к предыдущему шагу
 */
export function goBack(): void {
  const { currentStep } = widgetState;

  if (currentStep === 'appointment-details') {
    widgetState = {
      ...widgetState,
      currentStep: 'phone-input',
    };
  } else if (currentStep === 'phone-input') {
    widgetState = {
      ...widgetState,
      currentStep: 'date-time-selection',
    };
  } else if (currentStep === 'doctor-info') {
    // Определяем, откуда мы пришли - из specialist-selection или department-specialists-selection
    const previousStep = widgetState.selectedDepartmentId ? 'department-specialists-selection' : 'specialist-selection';
    widgetState = {
      ...widgetState,
      currentStep: previousStep,
    };
  } else if (currentStep === 'department-specialists-selection') {
    widgetState = {
      ...widgetState,
      currentStep: 'specialist-selection',
      selectedDepartmentId: null,
    };
  } else if (currentStep === 'specialist-selection' || currentStep === 'date-time-selection') {
    widgetState = {
      ...widgetState,
      currentStep: 'next-steps',
      selectionMode: undefined,
    };
  } else if (currentStep === 'next-steps') {
    widgetState = {
      ...widgetState,
      currentStep: 'branch-selection',
      selectedBranchId: null,
    };
  }

  notifyStateChange();
}
