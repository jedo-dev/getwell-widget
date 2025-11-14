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
export { Widget, WidgetProvider } from './components';
export type { WidgetProps } from './components';

// Export global registration
export { registerGlobalWidget } from './lib/global';

// Автоматическая регистрация глобальных функций при импорте
import { WidgetProvider } from './components';
import { registerGlobalWidget } from './lib/global';

if (typeof window !== 'undefined') {
  registerGlobalWidget(WidgetProvider);
}
