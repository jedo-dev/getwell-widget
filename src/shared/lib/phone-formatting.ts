/**
 * Утилиты для форматирования телефонных номеров
 */

/**
 * Форматирует номер телефона в формат +7 XXX XXX XX XX
 * @param value - Сырое значение телефона
 * @returns Отформатированный номер телефона
 */
export function formatPhone(value: string): string {
  // Удаляем все нецифровые символы
  const digits = value.replace(/[^\d]/g, '');

  // Если начинается с 8, заменяем на 7
  let formatted = digits.startsWith('8') ? '7' + digits.slice(1) : digits;

  // Ограничиваем до 11 цифр (7 + 10)
  if (formatted.length > 11) {
    formatted = formatted.slice(0, 11);
  }

  // Форматируем: +7 XXX XXX XX XX
  if (formatted.length === 0) {
    return '';
  }

  if (formatted.length <= 1) {
    return `+${formatted}`;
  }

  if (formatted.length <= 4) {
    return `+${formatted.slice(0, 1)} ${formatted.slice(1)}`;
  }

  if (formatted.length <= 7) {
    return `+${formatted.slice(0, 1)} ${formatted.slice(1, 4)} ${formatted.slice(4)}`;
  }

  if (formatted.length <= 9) {
    return `+${formatted.slice(0, 1)} ${formatted.slice(1, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
  }

  return `+${formatted.slice(0, 1)} ${formatted.slice(1, 4)} ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}`;
}

/**
 * Валидирует номер телефона
 * @param phone - Номер телефона (может быть отформатированным)
 * @returns Объект с результатом валидации
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  const digits = phone.replace(/[^\d]/g, '');

  if (digits.length === 0) {
    return { isValid: false, error: 'Введите номер телефона' };
  }

  if (digits.length !== 11) {
    return { isValid: false, error: 'Введите корректный номер телефона' };
  }

  if (!digits.startsWith('7')) {
    return { isValid: false, error: 'Номер должен начинаться с +7' };
  }

  return { isValid: true };
}

/**
 * Извлекает только цифры из номера телефона
 * @param phone - Номер телефона (может быть отформатированным)
 * @returns Только цифры
 */
export function extractPhoneDigits(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

