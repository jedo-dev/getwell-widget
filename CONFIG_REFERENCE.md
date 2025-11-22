# Справочник конфигурации виджета

Таблица всех доступных параметров конфигурации виджета GetWell.

## Основные параметры конфигурации

| Название               | Тип данных           | Описание                                                               |
| ---------------------- | -------------------- | ---------------------------------------------------------------------- |
| `theme`                | `WidgetTheme`        | Объект с настройками темы виджета (цвета)                              |
| `logo`                 | `string?`            | URL логотипа (устаревший, используйте `logoUrl`)                       |
| `logoUrl`              | `string?`            | URL логотипа в формате строки                                          |
| `desktopImageUrl`      | `string?`            | URL изображения для ПК в формате строки                                |
| `mobileImageUrl`       | `string?`            | URL изображения для мобильного устройства в формате строки             |
| `yandexMapFrameCode`   | `string?`            | Код фрейма Яндекс карт в формате строки (HTML iframe код)              |
| `apiUrl`               | `string?`            | URL API для получения данных                                           |
| `branches`             | `Branch[]?`          | Массив филиалов (если передан, используется вместо загрузки через API) |
| `employees`            | `Employee[]?`        | Массив сотрудников/врачей                                              |
| `departments`          | `Department[]?`      | Массив отделений                                                       |
| `defaultBranchId`      | `number?`            | ID филиала по умолчанию                                                |
| `showBranches`         | `boolean?`           | Показывать ли выбор филиалов                                           |
| `showEmployees`        | `boolean?`           | Показывать ли выбор сотрудников                                        |
| `showDepartments`      | `boolean?`           | Показывать ли выбор отделений                                          |
| `showDoctorInfo`       | `boolean?`           | Отображать ли информацию о врачах                                      |
| `showEmployeePosition` | `boolean?`           | Отображать ли должности/специализации врачей                           |
| `stickyBtnEnable`      | `boolean?`           | Включить плавающую кнопку для открытия виджета                         |
| `isNeedToBlankOpen`    | `boolean?`           | Открывать виджет в новом окне вместо Drawer                            |
| `renderedAsPage`       | `boolean?`           | Отрисовать виджет как отдельную страницу (без Drawer)                  |
| `isExternalLinkPolicy` | `boolean?`           | Открывать политику конфиденциальности по внешней ссылке                |
| `textPolicy`           | `string?`            | Текст политики конфиденциальности                                      |
| `linkToExternalPolicy` | `string?`            | Ссылка на внешнюю политику конфиденциальности                          |
| `stickyButtonPulse`    | `boolean?`           | Включить/выключить пульсацию плавающей кнопки                          |
| `stickyButtonPosition` | `'left' \| 'right'?` | Расположение плавающей кнопки (лево или право)                         |
| `stickyButtonColor`    | `string?`            | Цвет плавающей кнопки в hex формате (например #F3F4F8)                 |

## Параметры темы (WidgetTheme)

Объект `theme` содержит следующие свойства:

| Название          | Тип данных | Описание            |
| ----------------- | ---------- | ------------------- |
| `primaryColor`    | `string?`  | Основной цвет темы  |
| `secondaryColor`  | `string?`  | Вторичный цвет темы |
| `backgroundColor` | `string?`  | Цвет фона           |
| `textColor`       | `string?`  | Цвет текста         |

## Пример использования

```javascript
window.GetWellWidget.init({
  theme: {
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  logoUrl: 'https://example.com/logo.png',
  desktopImageUrl: 'https://example.com/desktop-image.jpg',
  mobileImageUrl: 'https://example.com/mobile-image.jpg',
  yandexMapFrameCode:
    '<iframe src="https://yandex.ru/map-widget/v1/?um=..." width="100%" height="572" frameborder="0"></iframe>',
  apiUrl: 'https://api.example.com',
  branches: [
    {
      id: 1,
      name: 'Филиал 1',
      address: 'г. Москва, ул. Примерная, д. 1',
      phone: '+7 (999) 123-45-67',
      schedule: 'Пн-Пт: 9:00-18:00',
    },
  ],
  defaultBranchId: 1,
  showBranches: true,
  showEmployees: true,
  showDepartments: true,
  stickyBtnEnable: true,
  stickyButtonPosition: 'right',
  stickyButtonColor: '#1890ff',
  stickyButtonPulse: true,
});
```
