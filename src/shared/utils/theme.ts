import { WidgetTheme } from '../../types';

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

const themeAccents = {
  dark: {
    primaryColor: '#344054',
    buttonPrimary: '#344054',
    buttonPrimaryHover: '#1D2939',
    textSecondary: '#344054',
    scrollbarColor: '#344054',
  },
  blue: {
    primaryColor: '#0142FF',
    buttonPrimary: '#0142FF',
    buttonPrimaryHover: '#0037D6',
    textSecondary: '#0142FF',
    scrollbarColor: '#0142FF',
  },
  red: {
    primaryColor: '#C01048',
    buttonPrimary: '#C01048',
    buttonPrimaryHover: '#A11043',
    textSecondary: '#C01048',
    scrollbarColor: '#C01048',
  },
  green: {
    primaryColor: '#039855',
    buttonPrimary: '#039855',
    buttonPrimaryHover: '#027A48',
    textSecondary: '#039855',
    scrollbarColor: '#039855',
  },
  orange: {
    primaryColor: '#F79009',
    buttonPrimary: '#F79009',
    buttonPrimaryHover: '#DC6803',
    textSecondary: '#F79009',
    scrollbarColor: '#F79009',
  },
  purple: {
    primaryColor: '#752BDF',
    buttonPrimary: '#752BDF',
    buttonPrimaryHover: '#601DC0',
    textSecondary: '#752BDF',
    scrollbarColor: '#752BDF',
  },
  aqua: {
    primaryColor: '#50B7BF',
    buttonPrimary: '#50B7BF',
    buttonPrimaryHover: '#119AA5',
    textSecondary: '#50B7BF',
    scrollbarColor: '#50B7BF',
  },
} as const;

type ThemeAccentKey = keyof typeof themeAccents;

function getAccentByThemeKey(themeKey?: string): Partial<WidgetTheme> | undefined {
  if (!themeKey) {
    return undefined;
  }

  const normalized = themeKey.trim().toLowerCase() as ThemeAccentKey;
  return themeAccents[normalized];
}

export function resolveTheme(theme?: WidgetTheme): Required<WidgetTheme> {
  const accent = getAccentByThemeKey(theme?.primaryColor);
  const normalizedTheme: WidgetTheme = {
    ...theme,
    primaryColor: accent ? accent.primaryColor : theme?.primaryColor,
  };

  return {
    ...defaultTheme,
    ...(accent ?? {}),
    ...normalizedTheme,
  };
}

export function applyTheme(theme?: WidgetTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const finalTheme = resolveTheme(theme);

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

export function getThemeVar(varName: string): string {
  if (typeof document === 'undefined') {
    return '';
  }
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
