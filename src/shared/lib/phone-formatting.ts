/**
 * Utilities for phone input, validation, and backend-friendly lookup normalization.
 */

export function formatPhone(value: string): string {
  const hasLeadingPlus = value.trimStart().startsWith('+');
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return hasLeadingPlus ? '+' : '';
  }

  return `${hasLeadingPlus ? '+' : ''}${digits}`;
}

export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  const normalized = phone.trim();
  const digits = phone.replace(/[^\d]/g, '');

  if (normalized.length === 0) {
    return { isValid: false, error: 'Введите номер телефона' };
  }

  if (digits.length === 0) {
    return { isValid: false, error: 'Введите корректный номер телефона' };
  }

  if (digits.length < 10) {
    return { isValid: false, error: 'Введите не менее 10 цифр номера' };
  }

  return { isValid: true };
}

export function extractPhoneDigits(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function normalizePhoneForLookup(phone: string): string {
  const digits = extractPhoneDigits(phone);

  if (digits.length === 10) {
    return `7${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('8')) {
    return `7${digits.slice(1)}`;
  }

  return digits;
}
