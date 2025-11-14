import { WidgetConfig, WidgetState } from '../types';

// Глобальное состояние виджета
let widgetState: WidgetState = {
  isOpen: false,
  config: null,
  initialized: false,
};

// Callbacks для уведомления компонентов об изменении состояния
let stateChangeCallbacks: Array<(state: WidgetState) => void> = [];

// Функция для подписки на изменения состояния
export function subscribeToStateChange(callback: (state: WidgetState) => void): () => void {
  stateChangeCallbacks.push(callback);
  
  // Возвращаем функцию отписки
  return () => {
    stateChangeCallbacks = stateChangeCallbacks.filter(cb => cb !== callback);
  };
}

// Функция для уведомления всех подписчиков об изменении состояния
function notifyStateChange() {
  stateChangeCallbacks.forEach(callback => callback(widgetState));
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
  };
  
  notifyStateChange();
}

