import { WidgetTheme } from '../../types';

/**
 * Дефолтные значения темы
 */
const defaultTheme: Required<WidgetTheme> = {
  primaryColor: '#344054',
  secondaryColor: '#52c41a',
  backgroundColor: '#ffffff',
  backgroundSecondary: '#f5f5f5',
  backgroundTertiary: '#fafafa',
  textColor: '#101828',
  textSecondary: '#344054',
  textTertiary: '#777777',
  textDisabled: '#c9c9c9',
  borderColor: '#f0f0f0',
  borderSecondary: '#eaecf0',
  borderTertiary: '#d0d5dd',
  errorColor: '#ff4d4f',
  successColor: '#52c41a',
  linkColor: '#1890ff',
  linkHoverColor: '#40a9ff',
  buttonPrimary: '#344054',
  buttonPrimaryHover: '#1f2937',
  buttonSecondary: '#d0d5dd',
  buttonText: '#ffffff',
  scrollbarColor: '#344054',
  tagBackground: '#1c29360d',
};

/**
 * Применить тему к документу через CSS переменные
 */
export function applyTheme(theme?: WidgetTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const finalTheme = { ...defaultTheme, ...theme };

  // Устанавливаем CSS переменные
  root.style.setProperty('--widget-primary-color', finalTheme.primaryColor);
  root.style.setProperty('--widget-secondary-color', finalTheme.secondaryColor);
  root.style.setProperty('--widget-background-color', finalTheme.backgroundColor);
  root.style.setProperty('--widget-background-secondary', finalTheme.backgroundSecondary);
  root.style.setProperty('--widget-background-tertiary', finalTheme.backgroundTertiary);
  root.style.setProperty('--widget-text-color', finalTheme.textColor);
  root.style.setProperty('--widget-text-secondary', finalTheme.textSecondary);
  root.style.setProperty('--widget-text-tertiary', finalTheme.textTertiary);
  root.style.setProperty('--widget-text-disabled', finalTheme.textDisabled);
  root.style.setProperty('--widget-border-color', finalTheme.borderColor);
  root.style.setProperty('--widget-border-secondary', finalTheme.borderSecondary);
  root.style.setProperty('--widget-border-tertiary', finalTheme.borderTertiary);
  root.style.setProperty('--widget-error-color', finalTheme.errorColor);
  root.style.setProperty('--widget-success-color', finalTheme.successColor);
  root.style.setProperty('--widget-link-color', finalTheme.linkColor);
  root.style.setProperty('--widget-link-hover-color', finalTheme.linkHoverColor);
  root.style.setProperty('--widget-button-primary', finalTheme.buttonPrimary);
  root.style.setProperty('--widget-button-primary-hover', finalTheme.buttonPrimaryHover);
  root.style.setProperty('--widget-button-secondary', finalTheme.buttonSecondary);
  root.style.setProperty('--widget-button-text', finalTheme.buttonText);
  root.style.setProperty('--widget-scrollbar-color', finalTheme.scrollbarColor);
  root.style.setProperty('--widget-tag-background', finalTheme.tagBackground);
}

/**
 * Получить значение CSS переменной темы
 */
export function getThemeVar(varName: string): string {
  if (typeof document === 'undefined') {
    return '';
  }
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

