/**
 * Периоды времени для слотов записи
 */
export enum TimePeriod {
  MORNING = 'morning',
  DAY = 'day',
  EVENING = 'evening',
}

/**
 * Лейблы для периодов времени
 */
export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  [TimePeriod.MORNING]: 'Утро',
  [TimePeriod.DAY]: 'День',
  [TimePeriod.EVENING]: 'Вечер',
};

