/**
 * Режимы выбора специалиста/отделения
 */
export enum SelectionMode {
  EMPLOYEE = 'employee',
  DEPARTMENT = 'department',
}

/**
 * Лейблы для режимов выбора
 */
export const SELECTION_MODE_LABELS: Record<SelectionMode, string> = {
  [SelectionMode.EMPLOYEE]: 'По ФИО',
  [SelectionMode.DEPARTMENT]: 'По отделению',
};

