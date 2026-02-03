# Использование в браузере

## Форматы сборки
Библиотека собирается в трех форматах:
- **`index.cjs.js`** - для Node.js (CommonJS) - зависимости внешние
- **`index.esm.js`** - для ES модулей - зависимости внешние
- **`index.umd.js`** - для браузера (UMD) ← **Используйте этот для HTML**
  - ✅ **Все зависимости включены в один файл!**
  - ✅ React, ReactDOM, Ant Design и Day.js включены в бандл
  - ✅ Не нужно подключать зависимости отдельно

## Что нужно изменить в вашем HTML:

### 1. Используйте UMD версию вместо CJS:
```html
<!-- ❌ НЕПРАВИЛЬНО -->
<script src="./dist/index.cjs.js"></script>

<!-- ✅ ПРАВИЛЬНО -->
<script src="./dist/index.umd.js"></script>
```

### 2. Подключите CSS UMD версии:
```html
<!-- ❌ НЕПРАВИЛЬНО -->
<link rel="stylesheet" href="./dist/index.cjs.css">

<!-- ✅ ПРАВИЛЬНО -->
<link rel="stylesheet" href="./dist/index.umd.css">
```

### 3. Подключение скрипта (всё в одном!):
```html
<!-- Просто подключите один скрипт - все зависимости уже внутри! -->
<script src="./dist/index.umd.js"></script>
```

**Ничего больше не нужно!** React, ReactDOM, Day.js и Ant Design уже включены в бандл.

## Полный пример правильного подключения:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Site</title>
    
    <!-- CSS виджета (включает все необходимые стили) -->
    <link rel="stylesheet" href="./dist/index.umd.css">
</head>
<body>
    <button onclick="window.GetWellWidget.open()">Записаться</button>
    <div id="widget-root"></div>

    <!-- Один скрипт - всё включено! -->
    <script src="./dist/index.umd.js"></script>
    
    <script>
        // Инициализация
        window.addEventListener('DOMContentLoaded', function() {
            if (window.GetWellWidget) {
                window.GetWellWidget.init({
                    apiUrl: 'https://api.example.com',
                    theme: { primaryColor: '#1890ff' }
                });
                
                // Рендер виджета
                if (window.GetWellWidget.WidgetProvider && window.React && window.ReactDOM) {
                    const root = window.ReactDOM.createRoot(document.getElementById('widget-root'));
                    root.render(window.React.createElement(window.GetWellWidget.WidgetProvider));
                }
            }
        });
    </script>
</body>
</html>
```

## Важно:
- ✅ Используйте **`index.umd.js`** и **`index.umd.css`** для браузера
- ✅ **Все зависимости включены в один бандл!** Не нужно подключать React, ReactDOM, Day.js или Ant Design отдельно
- ✅ Просто подключите один скрипт и один CSS файл - всё готово к работе!

