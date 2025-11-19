// Main entry point for the library

// Export types
export * from './types';

// Export widget manager functions
export {
  closeGetWellWidget,
  getWidgetState,
  initGetWellWidget,
  openGetWellWidget,
  resetGetWellWidget,
  subscribeToStateChange,
} from './lib/widget-manager';

// Export components
export { WidgetProvider } from './app/providers';
export { Widget } from './components';
export type { WidgetProps } from './components';

// Export global registration
export { registerGlobalWidget } from './lib/global';

// Автоматическая регистрация глобальных функций при импорте
import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import { WidgetProvider } from './app/providers';
import { registerGlobalWidget } from './lib/global';

if (typeof window !== 'undefined') {
  // Полифилл для process (для зависимостей, которые его используют)
  if (typeof (window as any).process === 'undefined') {
    (window as any).process = { env: {} };
  }

  registerGlobalWidget(WidgetProvider);

  // Экспортируем React глобально
  if (!window.React) {
    (window as any).React = React;
  }

  // Экспортируем ReactDOM глобально
  if (!window.ReactDOM) {
    (window as any).ReactDOM = ReactDOM || {};
  }

  // Добавляем createRoot из react-dom/client (React 18+)
  if (ReactDOMClient && typeof ReactDOMClient.createRoot === 'function') {
    if (!window.ReactDOM) {
      (window as any).ReactDOM = {};
    }
    (window as any).ReactDOM.createRoot = ReactDOMClient.createRoot;
  }

  // Экспортируем старый render для совместимости (React < 18)
  // if (ReactDOM && typeof ReactDOM.render === 'function') {
  //   if (!window.ReactDOM) {
  //     (window as any).ReactDOM = {};
  //   }
  //   (window as any).ReactDOM.render = ReactDOM.render;
  // }
}
