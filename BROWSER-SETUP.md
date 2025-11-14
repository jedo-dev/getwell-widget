# Исправление: Использование в браузере

## Проблема
Ошибка `exports is not defined` возникала потому, что `index.cjs.js` использует CommonJS формат, который не работает напрямую в браузере.

## Решение
Теперь библиотека собирается в трех форматах:
- **`index.cjs.js`** - для Node.js (CommonJS)
- **`index.esm.js`** - для ES модулей
- **`index.umd.js`** - для браузера (UMD) ← **Используйте этот для HTML**

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

### 3. Важен порядок подключения скриптов:
```html
<!-- 1. React и ReactDOM ПЕРВЫМИ -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- 2. Day.js (обязательно для Ant Design!) -->
<script src="https://unpkg.com/dayjs@1.11.10/dayjs.min.js"></script>

<!-- 3. Ant Design JS -->
<script src="https://unpkg.com/antd@5.28.1/dist/antd.min.js"></script>

<!-- 4. Виджет ПОСЛЕДНИМ -->
<script src="./dist/index.umd.js"></script>
```

## Полный пример правильного подключения:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Site</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd@5.28.1/dist/reset.css">
    <link rel="stylesheet" href="./dist/index.umd.css">
</head>
<body>
    <button onclick="window.GetWellWidget.open()">Записаться</button>
    <div id="widget-root"></div>

    <!-- JS в правильном порядке -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/dayjs@1.11.10/dayjs.min.js"></script>
    <script src="https://unpkg.com/antd@5.28.1/dist/antd.min.js"></script>
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
- ✅ Порядок скриптов критичен: React → ReactDOM → Day.js → Ant Design → Виджет
- ✅ Не забудьте подключить Day.js (обязательно для Ant Design!)
- ✅ Не забудьте подключить Ant Design JS через CDN

