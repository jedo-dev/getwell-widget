# План рефакторинга проекта GetWell Widget

## ✅ Выполнено

### 1. Вынос констант и ENUM'ов
- ✅ `src/shared/constants/widget-steps.ts` - шаги виджета
- ✅ `src/shared/constants/appointment-types.ts` - типы приема
- ✅ `src/shared/constants/selection-modes.ts` - режимы выбора
- ✅ `src/shared/constants/gender.ts` - пол клиента/питомца
- ✅ `src/shared/constants/time-periods.ts` - периоды времени
- ✅ `src/shared/constants/date-formatting.ts` - константы для форматирования дат
- ✅ `src/shared/constants/pet-species.ts` - виды питомцев

### 2. Создание утилит
- ✅ `src/shared/lib/phone-formatting.ts` - форматирование и валидация телефонов
- ✅ `src/shared/lib/date-formatting.ts` - форматирование дат
- ✅ `src/shared/lib/employee-formatting.ts` - форматирование ФИО сотрудников

### 3. Централизованная система типов
- ✅ Обновлен `src/types/index.ts` - использует enum'ы вместо строковых литералов
- ✅ `src/shared/types/api.ts` - типы для API запросов и ответов

### 4. Моковый API слой
- ✅ `src/shared/api/instance.ts` - базовый HTTP клиент
- ✅ `src/shared/api/branches.ts` - API для филиалов
- ✅ `src/shared/api/employees.ts` - API для сотрудников
- ✅ `src/shared/api/departments.ts` - API для отделений
- ✅ `src/shared/api/pets.ts` - API для питомцев
- ✅ `src/shared/api/clients.ts` - API для клиентов
- ✅ `src/shared/api/appointments.ts` - API для записей

## 📋 План дальнейших действий

### 5. Реорганизация по FSD (Feature-Sliced Design) ⏳ В процессе

**✅ Создано:**
- `src/app/providers/WidgetProvider.tsx` - провайдер виджета
- `src/widgets/appointment-widget/ui/StickyButton.tsx` - пример виджета
- `src/features/branch-selection/` - пример feature (BranchSelection)
- `FSD_MIGRATION_GUIDE.md` - подробное руководство по миграции

**⏳ Осталось:**
- Переместить Widget.tsx в widgets/appointment-widget/ui
- Переместить остальные features компоненты
- Обновить все импорты
- Использовать константы вместо магических строк

#### Текущая структура:
```
src/
  components/     - все компоненты в одной папке
  lib/            - утилиты и моки
  types/          - типы
  api/            - пустая папка
```

#### Предлагаемая структура FSD:

```
src/
  app/                    # Инициализация приложения
    providers/            # Провайдеры (WidgetProvider, ConfigProvider)
    init/                # Инициализация виджета
    
  widgets/               # Крупные составные блоки
    appointment-widget/   # Основной виджет записи
      ui/                # Компоненты виджета (Widget.tsx)
      
  features/              # Бизнес-функции
    branch-selection/    # Выбор филиала
    specialist-selection/# Выбор специалиста
    department-selection/# Выбор отделения
    date-time-selection/ # Выбор даты и времени
    phone-input/         # Ввод телефона
    appointment-details/ # Детали записи
    appointment-confirmation/ # Подтверждение записи
    doctor-info/         # Информация о враче
    pet-management/      # Управление питомцами (AddPetModal)
    
  entities/              # Бизнес-сущности
    branch/              # Филиал
      api/              # API методы
      model/            # Типы и интерфейсы
      ui/               # UI компоненты (если есть)
    employee/           # Сотрудник
    department/         # Отделение
    pet/                # Питомец
    client/             # Клиент
    appointment/        # Запись
    
  shared/                # Переиспользуемый код
    api/                # ✅ API методы (уже создано)
    constants/          # ✅ Константы (уже создано)
    lib/                # ✅ Утилиты (уже создано)
    types/              # ✅ Типы (уже создано)
    ui/                 # Общие UI компоненты
      Avatar/           # Аватар (для врачей)
      Card/             # Карточка информации
      EmptyState/       # Пустое состояние
      Loading/          # Индикатор загрузки
    hooks/              # Переиспользуемые хуки
    config/             # Конфигурация
```

### 6. Вынос общих UI компонентов

Компоненты для выноса в `shared/ui/`:
- **Avatar** - аватар врача (используется в SpecialistSelection, DoctorInfo, AppointmentDetails)
- **InfoCard** - карточка с информацией (используется в AppointmentDetails, AppointmentConfirmation)
- **EmptyState** - пустое состояние (используется в нескольких списках)
- **BackButton** - кнопка "Назад" (используется в нескольких местах)

### 7. Миграция существующего кода

#### Порядок миграции:
1. Обновить импорты констант в существующих файлах
2. Заменить использование утилит форматирования
3. Переместить компоненты в соответствующие слои FSD
4. Обновить импорты во всех файлах
5. Удалить старые файлы из `lib/` (branches-data.ts, employees-data.ts и т.д.)

## 📝 Примечания

- Все моковые данные теперь в `shared/api/`
- Старые файлы `lib/*-data.ts` можно будет удалить после миграции
- API методы готовы к замене на реальные - достаточно раскомментировать код в `shared/api/instance.ts`

