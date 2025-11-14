# Инструкция по использованию GetWell Widget

## Что нужно скопировать из папки `dist`:

Для работы виджета в обычном HTML файле вам нужно скопировать следующие файлы:

### Обязательные файлы для использования в браузере:

1. **`dist/index.umd.js`** - JavaScript библиотека в формате UMD (для браузера)
2. **`dist/index.umd.css`** - стили виджета

**Примечание:** Для использования в Node.js используйте `index.cjs.js`, для ES модулей - `index.esm.js`

### Дополнительные файлы (опционально):

- **`dist/index.d.ts`** - TypeScript определения типов (если используете TypeScript)
- **`dist/*.js.map`** и **`dist/*.css.map`** - source maps для отладки

## Структура папок для вашего HTML проекта:

```
your-project/
├── index.html (ваш HTML файл)
├── getwell-widget/
│   ├── index.umd.js  (UMD версия для браузера)
│   └── index.umd.css
└── ...
```

## Пример подключения в HTML:

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Website</title>

    <!-- Ant Design CSS (обязательно для виджета) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd@5.28.1/dist/reset.css" />

    <!-- CSS виджета -->
    <link rel="stylesheet" href="./getwell-widget/index.umd.css" />
  </head>
  <body>
    <h1>Мой сайт</h1>
    <button onclick="window.GetWellWidget.open()">Записаться онлайн</button>

    <!-- Контейнер для виджета -->
    <div id="widget-root"></div>

    <!-- React и ReactDOM (обязательно для виджета - ПЕРЕД виджетом!) -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    ></script>

    <!-- Day.js (обязательно для Ant Design!) -->
    <script src="https://unpkg.com/dayjs@1.11.10/dayjs.min.js"></script>

    <!-- Ant Design JS через CDN -->
    <script src="https://unpkg.com/antd@5.28.1/dist/antd.min.js"></script>

    <!-- Библиотека GetWell Widget (UMD версия для браузера) -->
    <script src="./getwell-widget/index.umd.js"></script>

    <script>
      // Инициализация виджета при загрузке страницы
      window.addEventListener('DOMContentLoaded', function () {
        // 1. Инициализируем виджет
        if (window.GetWellWidget) {
          window.GetWellWidget.init({
            apiUrl: 'https://your-api.com',
            theme: {
              primaryColor: '#1890ff',
            },
          });

          // 2. Рендерим WidgetProvider
          if (window.GetWellWidget.WidgetProvider && window.React && window.ReactDOM) {
            const root = window.ReactDOM.createRoot(document.getElementById('widget-root'));
            root.render(window.React.createElement(window.GetWellWidget.WidgetProvider));
          }
        }
      });

      // Функция для открытия виджета (можно использовать в любой кнопке)
      function openWidget() {
        if (window.GetWellWidget) {
          window.GetWellWidget.open();
        }
      }
    </script>
  </body>
</html>
```

## Доступные функции:

После подключения библиотеки доступны следующие функции через `window.GetWellWidget`:

- **`init(config)`** - инициализация виджета с конфигурацией
- **`open()`** - открыть виджет
- **`close()`** - закрыть виджет
- **`reset()`** - сбросить состояние виджета

## Быстрый старт:

1. Скопируйте файлы из `dist` в папку вашего проекта
2. Подключите CSS и JS файлы в ваш HTML
3. Подключите React и ReactDOM через CDN (или локально)
4. Инициализируйте виджет при загрузке страницы
5. Отрендерите `WidgetProvider` в нужном месте
6. Используйте `window.GetWellWidget.open()` для открытия виджета

## Готовый пример:

В корне проекта есть файл `example.html` с рабочим примером использования виджета.
