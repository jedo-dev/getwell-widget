/**
 * Типы приема
 */
export enum AppointmentType {
  CONSULTATION = 'consultation',
  EXAMINATION = 'examination',
  PROCEDURE = 'procedure',
  OTHER = 'other',
}

/**
 * Лейблы для типов приема
 */
export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  [AppointmentType.CONSULTATION]: 'Консультация',
  [AppointmentType.EXAMINATION]: 'Осмотр',
  [AppointmentType.PROCEDURE]: 'Процедура',
  [AppointmentType.OTHER]: 'Другое',
};

