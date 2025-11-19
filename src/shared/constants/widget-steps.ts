/**
 * Шаги виджета записи на прием
 */
export enum WidgetStep {
  BRANCH_SELECTION = 'branch-selection',
  NEXT_STEPS = 'next-steps',
  SPECIALIST_SELECTION = 'specialist-selection',
  DEPARTMENT_SPECIALISTS_SELECTION = 'department-specialists-selection',
  DOCTOR_INFO = 'doctor-info',
  DATE_TIME_SELECTION = 'date-time-selection',
  PHONE_INPUT = 'phone-input',
  APPOINTMENT_DETAILS = 'appointment-details',
  APPOINTMENT_CONFIRMATION = 'appointment-confirmation',
}

/**
 * Массив всех шагов виджета (для валидации)
 */
export const WIDGET_STEPS = Object.values(WidgetStep) as WidgetStep[];
