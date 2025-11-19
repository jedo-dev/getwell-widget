// Export all components from here
// ВНИМАНИЕ: Этот файл оставлен для обратной совместимости
// Новые компоненты находятся в структуре FSD:
// - Widget: widgets/appointment-widget
// - WidgetProvider: app/providers

// Реэкспорт из новой структуры
export { WidgetProvider } from '../app/providers';
export { Widget } from '../widgets/appointment-widget/ui';
export type { WidgetProps } from '../widgets/appointment-widget/ui';
