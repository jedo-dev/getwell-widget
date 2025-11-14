import React from 'react';
import { WidgetConfig } from '../types';
import {
  closeGetWellWidget,
  initGetWellWidget,
  openGetWellWidget,
  resetGetWellWidget,
} from './widget-manager';

// Тип для Window с нашими функциями
declare global {
  interface Window {
    GetWellWidget: {
      init: (config: WidgetConfig) => void;
      open: () => void;
      close: () => void;
      reset: () => void;
      WidgetProvider?: React.ComponentType;
    };
  }
}

// Функция для инициализации глобальных функций
export function registerGlobalWidget(WidgetProvider?: React.ComponentType): void {
  if (typeof window !== 'undefined') {
    window.GetWellWidget = {
      init: initGetWellWidget,
      open: openGetWellWidget,
      close: closeGetWellWidget,
      reset: resetGetWellWidget,
      WidgetProvider,
    };
  }
}
