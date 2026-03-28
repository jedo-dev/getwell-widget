import { fetchWidgetConfig } from '../shared/api/widget-config';
import { SelectionMode, WidgetStep } from '../shared/constants';
import { WidgetConfig, WidgetState } from '../types';

// Глобальное состояние виджета

let widgetState: WidgetState = {
  isOpen: false,
  config: null,
  initialized: false,
  currentStep: WidgetStep.BRANCH_SELECTION,
  selectedBranchId: null,
  selectedEmployeeId: null,
  selectedDepartmentId: null,
  selectedTimeSlot: null,
  selectedTimeSlotTo: null,
  phone: null,
  selectedPetId: null,
  selectedPatientTypeId: undefined,
  selectedBreedId: undefined,
  reservedTimeslotHash: null,
  appointmentDetailsDraft: undefined,
};

// let widgetState: WidgetState = {
//   isOpen: true,
//   config: {
//     apiUrl: 'https://api.example.com',
//     theme: {
//       primaryColor: '#1890ff',
//       secondaryColor: '#52c41a',
//     },
//     showBranches: true,
//     showEmployees: true,
//     showDepartments: true,
//     stickyBtnEnable: true,
//   },
//   initialized: true,
//   currentStep: 'appointment-confirmation',
//   selectedBranchId: 3,
//   selectedEmployeeId: 2,
//   selectedDepartmentId: null,
//   selectedTimeSlot: '2025-11-19T15:30:00',
//   phone: '+7 909 646 84 44',
//   selectedPetId: null,
//   selectionMode: 'employee',
//   isNewUser: true,
// } as WidgetState;
// let widgetState: WidgetState = {
//   "isOpen": true,
//   "config": {
//       "apiUrl": "https://api.example.com",
//       "theme": {
//           "primaryColor": "#1890ff",
//           "secondaryColor": "#52c41a"
//       },
//       "showBranches": true,
//       "showEmployees": true,
//       "showDepartments": true,
//       "stickyBtnEnable": true
//   },
//   "initialized": true,
//   "currentStep": "appointment-confirmation",
//   "selectedBranchId": 1,
//   "selectedEmployeeId": 2,
//   "selectedDepartmentId": null,
//   "selectedTimeSlot": "2025-11-19T15:30:00",
//   "phone": "+7 909 646 84 44",
//   "selectedPetId": 1,
//   "selectionMode": "employee",
//   "isNewUser": false
// } as WidgetState;

// Callbacks для уведомления компонентов об изменении состояния
let stateChangeCallbacks: Array<(state: WidgetState) => void> = [];

function getSingleBranchId(config?: WidgetConfig | null): number | null {
  if (!config?.branches || config.branches.length !== 1) {
    return null;
  }

  return config.branches[0]?.id ?? null;
}

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
export async function initGetWellWidget(config?: WidgetConfig): Promise<void> {
  // 1) Берём конфиг из аргумента или из window.GetWellWidgetConfig
  const windowConfig =
    typeof window !== 'undefined' ? (window as any).GetWellWidgetConfig : undefined;

  const inputConfig: WidgetConfig = (config ?? windowConfig ?? {}) as WidgetConfig;

  // 2) Определяем, работаем ли мы в офлайн-режиме (без запросов к API)
  const hasLocalData =
    (inputConfig.branches && inputConfig.branches.length > 0) ||
    (inputConfig.employees && inputConfig.employees.length > 0) ||
    (inputConfig.departments && inputConfig.departments.length > 0);

  const isOffline =
    inputConfig.offlineMode === true || (!inputConfig.apiUrl && hasLocalData);

  let finalConfig: WidgetConfig = inputConfig;

  // 3) В онлайне можем подтянуть конфиг с сервера
  if (!isOffline && inputConfig.apiUrl) {
    try {
      const serverConfig = await fetchWidgetConfig(inputConfig);
      if (serverConfig) {
        finalConfig = serverConfig;
      }
    } catch (error) {
      console.warn('Failed to fetch widget config from server, using initial config:', error);
    }
  }

  // 4) Применяем дефолты
  const normalizedConfig: WidgetConfig = {
    ...finalConfig,
    showBranches: finalConfig.showBranches ?? true,
    showEmployees: finalConfig.showEmployees ?? true,
    showDepartments: finalConfig.showDepartments ?? true,
    offlineMode: isOffline,
    render: {
      preserveStepOnOpen: finalConfig.render?.preserveStepOnOpen ?? false,
      lockStep: finalConfig.render?.lockStep ?? false,
      currentStep: finalConfig.render?.currentStep,
      selectedBranchId: finalConfig.render?.selectedBranchId,
    },
  };

  widgetState = {
    ...widgetState,
    config: normalizedConfig,
    initialized: true,
  };

  // 5) Принудительный шаг (для предпросмотра)
  if (normalizedConfig.render?.currentStep) {
    widgetState = {
      ...widgetState,
      currentStep: normalizedConfig.render.currentStep,
    };
  }

  if (normalizedConfig.render?.selectedBranchId !== undefined) {
    widgetState = {
      ...widgetState,
      selectedBranchId: normalizedConfig.render.selectedBranchId ?? null,
    };
  }

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

  const preserve = widgetState.config?.render?.preserveStepOnOpen === true;
  const forcedStep = widgetState.config?.render?.currentStep;
  const forcedBranchId = widgetState.config?.render?.selectedBranchId ?? null;
  const singleBranchId = getSingleBranchId(widgetState.config);
  const shouldSkipBranchSelection = !forcedStep && !forcedBranchId && Boolean(singleBranchId);

  // В режиме предпросмотра (preserveStepOnOpen) не сбрасываем состояние,
  // чтобы Flutter-админка могла менять конфиг "на лету" и сразу видеть результат.
  if (preserve) {
    widgetState = {
      ...widgetState,
      isOpen: true,
    };

    // Если задан текущий шаг в конфиге — применяем его (даже если preserve включён)
    if (forcedStep) {
      widgetState = {
        ...widgetState,
        currentStep: forcedStep,
      };
    }

    if (widgetState.config?.render?.selectedBranchId !== undefined) {
      widgetState = {
        ...widgetState,
        selectedBranchId: forcedBranchId,
      };
    }

    if (shouldSkipBranchSelection) {
      widgetState = {
        ...widgetState,
        currentStep: WidgetStep.NEXT_STEPS,
        selectedBranchId: singleBranchId,
      };
    }

    notifyStateChange();
    return;
  }

  widgetState = {
    ...widgetState,
    isOpen: true,
    currentStep:
      shouldSkipBranchSelection ? WidgetStep.NEXT_STEPS : forcedStep ?? WidgetStep.BRANCH_SELECTION,
    selectedBranchId: shouldSkipBranchSelection ? singleBranchId : forcedBranchId,
    selectedEmployeeId: null,
    selectedDepartmentId: null,
    selectionMode: undefined,
    selectedTimeSlot: null,
    selectedTimeSlotTo: null,
    phone: null,
    selectedPetId: null,
    selectedPatientTypeId: undefined,
    selectedBreedId: undefined,
    reservedTimeslotHash: null,
    appointmentDetailsDraft: undefined,
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
    currentStep: WidgetStep.BRANCH_SELECTION,
    selectedBranchId: null,
    selectedEmployeeId: null,
    selectedDepartmentId: null,
    selectionMode: undefined,
    selectedTimeSlot: null,
    selectedTimeSlotTo: null,
    phone: null,
    selectedPetId: null,
    selectedPatientTypeId: undefined,
    selectedBreedId: undefined,
    reservedTimeslotHash: null,
    appointmentDetailsDraft: undefined,
  };

  notifyStateChange();
}

/**
 * Установка выбранного филиала и переход к следующему шагу
 */
export function selectBranch(branchId: number): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    selectedBranchId: branchId,
    currentStep: WidgetStep.NEXT_STEPS,
  };

  notifyStateChange();
}

/**
 * Переход к выбору специалиста
 */
export function goToSpecialistSelection(): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    currentStep: WidgetStep.SPECIALIST_SELECTION,
    selectionMode: SelectionMode.EMPLOYEE,
  };

  notifyStateChange();
}

/**
 * Переход к выбору отделения
 */
export function goToDepartmentSelection(): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    currentStep: WidgetStep.SPECIALIST_SELECTION,
    selectionMode: SelectionMode.DEPARTMENT,
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
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    selectedDepartmentId: departmentId,
    currentStep: WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION,
  };

  notifyStateChange();
}

/**
 * Выбор отделения и переход к списку врачей отделения
 */
export function selectDepartmentOnly(departmentId: number): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    selectedDepartmentId: departmentId,
  };

  notifyStateChange();
}

/**
 * Переход к списку врачей отделения
 */
export function goToDepartmentSpecialistsSelection(): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    currentStep: WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION,
  };

  notifyStateChange();
}

/**
 * Переход к выбору даты и времени
 */
export function goToDateTimeSelection(): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    currentStep: WidgetStep.DATE_TIME_SELECTION,
  };

  notifyStateChange();
}

/**
 * Выбор даты и времени
 */
export function selectDateTime(dateTime: string | null, dateTimeTo?: string | null): void {
  widgetState = {
    ...widgetState,
    selectedTimeSlot: dateTime,
    selectedTimeSlotTo: dateTimeTo ?? widgetState.selectedTimeSlotTo,
  };

  notifyStateChange();
}

/**
 * Сохранение unique_hash резервирования временного слота
 */
export function setReservedTimeslotHash(hash: string | null): void {
  widgetState = {
    ...widgetState,
    reservedTimeslotHash: hash,
  };

  notifyStateChange();
}

/**
 * Переход к вводу телефона
 */
export function goToPhoneInput(): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    currentStep: WidgetStep.PHONE_INPUT,
  };

  notifyStateChange();
}

/**
 * Сохранение телефона и переход к деталям записи
 */
export function savePhoneAndGoToDetails(
  phone: string,
  isNewUser: boolean = false,
  ownerData?: WidgetState['ownerData'],
): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    phone,
    isNewUser,
    ownerData,
    currentStep: WidgetStep.APPOINTMENT_DETAILS,
  };

  notifyStateChange();
}

/**
 * Переход к деталям записи
 */
export function goToAppointmentDetails(): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    currentStep: WidgetStep.APPOINTMENT_DETAILS,
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
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    currentStep: WidgetStep.APPOINTMENT_CONFIRMATION,
    appointmentDetailsDraft: undefined,
  };

  notifyStateChange();
}

/**
 * Переход к экрану информации о враче
 */
export function goToDoctorInfo(): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    currentStep: WidgetStep.DOCTOR_INFO,
  };

  notifyStateChange();
}

/**
 * Переход к политике конфиденциальности
 */
export function goToPrivacyPolicy(): void {
  if (widgetState.config?.render?.lockStep) return;
  widgetState = {
    ...widgetState,
    currentStep: WidgetStep.PRIVACY_POLICY,
  };

  notifyStateChange();
}

export function saveAppointmentDetailsDraft(
  draft: WidgetState['appointmentDetailsDraft'],
): void {
  widgetState = {
    ...widgetState,
    appointmentDetailsDraft: draft,
  };
}

/**
 * Выбор типа животного
 */
export function selectPatientType(typeId: number): void {
  widgetState = {
    ...widgetState,
    selectedPatientTypeId: typeId,
    selectedBreedId: undefined, // сбрасываем породу при смене типа
  };

  notifyStateChange();
}

/**
 * Выбор породы
 */
export function selectBreed(breedId: number): void {
  widgetState = {
    ...widgetState,
    selectedBreedId: breedId,
  };

  notifyStateChange();
}

/**
 * Возврат к предыдущему шагу
 */
export async function goBack(): Promise<void> {
  if (widgetState.config?.render?.lockStep) return;
  const { currentStep } = widgetState;

  // Если возвращаемся назад с экрана ввода телефона, отменяем резервирование
  if (
    currentStep === WidgetStep.PHONE_INPUT &&
    widgetState.reservedTimeslotHash &&
    widgetState.config?.apiUrl
  ) {
    try {
      const { schedulesApi } = await import('../shared/api/schedules');
      await schedulesApi.cancelTimeslotReservation({
        apiUrl: widgetState.config.apiUrl,
        uniqueHash: widgetState.reservedTimeslotHash,
      });
      // Очищаем unique_hash после успешной отмены
      widgetState = {
        ...widgetState,
        reservedTimeslotHash: null,
      };
    } catch (error) {
      console.error('Ошибка отмены резервирования:', error);
      // Продолжаем выполнение даже при ошибке отмены
    }
  }

  if (currentStep === WidgetStep.PRIVACY_POLICY) {
    widgetState = {
      ...widgetState,
      currentStep: WidgetStep.APPOINTMENT_DETAILS,
    };
  } else if (currentStep === 'appointment-details') {
    widgetState = {
      ...widgetState,
      currentStep: WidgetStep.PHONE_INPUT,
    };
  } else if (currentStep === 'phone-input') {
    widgetState = {
      ...widgetState,
      currentStep: WidgetStep.DATE_TIME_SELECTION,
    };
  } else if (currentStep === 'doctor-info') {
    // Определяем, откуда мы пришли - из specialist-selection или department-specialists-selection
    const previousStep = widgetState.selectedDepartmentId
      ? WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION
      : WidgetStep.SPECIALIST_SELECTION;
    widgetState = {
      ...widgetState,
      currentStep: previousStep,
    };
  } else if (currentStep === 'department-specialists-selection') {
    widgetState = {
      ...widgetState,
      currentStep: WidgetStep.SPECIALIST_SELECTION,
      selectedDepartmentId: null,
    };
  } else if (
    currentStep === WidgetStep.SPECIALIST_SELECTION ||
    currentStep === WidgetStep.DATE_TIME_SELECTION
  ) {
    widgetState = {
      ...widgetState,
      currentStep: WidgetStep.NEXT_STEPS,
      selectionMode: undefined,
    };
  } else if (currentStep === WidgetStep.NEXT_STEPS) {
    widgetState = {
      ...widgetState,
      currentStep: WidgetStep.BRANCH_SELECTION,
      selectedBranchId: null,
    };
  }

  notifyStateChange();
}


/**
 * Применить конфиг на лету (hot reload) — для iframe/админки.
 * По умолчанию обновляет конфиг и триггерит перерендер.
 */
export function applyConfig(
  nextConfig: WidgetConfig,
  options?: { resetState?: boolean; rerender?: boolean },
): void {
  const prevConfig = widgetState.config ?? ({} as WidgetConfig);

  // Простой merge (с учётом вложенных theme/render)
  const mergedConfig: WidgetConfig = {
    ...prevConfig,
    ...nextConfig,
    theme: {
      ...(prevConfig.theme ?? {}),
      ...(nextConfig.theme ?? {}),
    },
    render: {
      ...(prevConfig.render ?? {}),
      ...(nextConfig.render ?? {}),
    },
  };

  const hasLocalData =
    (mergedConfig.branches && mergedConfig.branches.length > 0) ||
    (mergedConfig.employees && mergedConfig.employees.length > 0) ||
    (mergedConfig.departments && mergedConfig.departments.length > 0);

  const isOffline =
    mergedConfig.offlineMode === true || (!mergedConfig.apiUrl && hasLocalData);

  mergedConfig.offlineMode = isOffline;

  widgetState = {
    ...widgetState,
    config: mergedConfig,
  };

  if (options?.resetState) {
    widgetState = {
      ...widgetState,
      selectedBranchId: null,
      selectedEmployeeId: null,
      selectedDepartmentId: null,
      selectionMode: undefined,
      selectedTimeSlot: null,
      selectedTimeSlotTo: null,
      phone: null,
      selectedPetId: null,
      selectedPatientTypeId: undefined,
      selectedBreedId: undefined,
      reservedTimeslotHash: null,
      appointmentDetailsDraft: undefined,
    };
  }

  // Принудительный шаг из render.currentStep — применяется всегда
  if (mergedConfig.render?.currentStep) {
    widgetState = {
      ...widgetState,
      currentStep: mergedConfig.render.currentStep,
    };
  }

  if (mergedConfig.render?.selectedBranchId !== undefined) {
    widgetState = {
      ...widgetState,
      selectedBranchId: mergedConfig.render.selectedBranchId ?? null,
    };
  }

  // По умолчанию делаем notify
  if (options?.rerender === false) return;
  notifyStateChange();
}
