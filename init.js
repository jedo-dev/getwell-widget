(function (config) {
  config = config || window.GetWellWidgetConfig || {};
  const basePath = config.basePath || './dist';

  // Добавляем CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = basePath + '/index.umd.css';
  document.head.appendChild(link);

  // Загружаем JS
  const script = document.createElement('script');
  script.src = basePath + '/index.umd.js';
  script.onload = function () {
    // Создаём корневой элемент для виджета
    const widgetRoot = document.createElement('div');
    widgetRoot.id = 'widget-root';
    document.body.appendChild(widgetRoot);

    if (window.GetWellWidget && config.apiUrl) {
      const { basePath: _, ...initConfig } = config;
      // Асинхронная инициализация с загрузкой конфига
      window.GetWellWidget.init(initConfig)
        .then(() => {
          if (window.GetWellWidget.WidgetProvider && window.React && window.ReactDOM) {
            const root = window.ReactDOM.createRoot(widgetRoot);
            root.render(window.React.createElement(window.GetWellWidget.WidgetProvider));
          }
        })
        .catch((error) => {
          console.error('Failed to initialize widget:', error);
          // В случае ошибки все равно рендерим виджет с начальным конфигом
          if (window.GetWellWidget.WidgetProvider && window.React && window.ReactDOM) {
            const root = window.ReactDOM.createRoot(widgetRoot);
            root.render(window.React.createElement(window.GetWellWidget.WidgetProvider));
          }
        });
    }
  };
  document.body.appendChild(script);
})(window.GetWellWidgetConfig);
