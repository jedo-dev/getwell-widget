# Руководство по миграции на FSD структуру

## Текущий статус

✅ **Создано:**
- `src/shared/` - константы, утилиты, типы, API
- `src/app/providers/WidgetProvider.tsx` - провайдер виджета
- `src/widgets/appointment-widget/ui/StickyButton.tsx` - пример виджета

## Структура миграции

### 1. Widgets (Крупные составные блоки)

**Путь:** `src/widgets/appointment-widget/ui/`

**Компоненты для перемещения:**
- ✅ `StickyButton.tsx` + `StickyButton.css` - уже перемещен
- ⏳ `Widget.tsx` + `Widget.css` - нужно переместить

**Импорты в Widget.tsx нужно обновить:**
```typescript
// Старые импорты
import BranchSelection from './BranchSelection';
import NextSteps from './NextSteps';
// ... и т.д.

// Новые импорты
import { BranchSelection } from '../../../features/branch-selection';
import { NextSteps } from '../../../features/next-steps';
// ... и т.д.
```

### 2. Features (Бизнес-функции)

Каждая feature должна иметь структуру:
```
features/
  feature-name/
    ui/          # UI компоненты
    model/       # Типы и интерфейсы (если нужны)
    api/         # API методы (если нужны)
    index.ts     # Публичный API feature
```

**Features для создания:**

#### `features/branch-selection/`
- `ui/BranchSelection.tsx` + `BranchSelection.css`
- `index.ts` - экспорт компонента

#### `features/specialist-selection/`
- `ui/SpecialistSelection.tsx` + `SpecialistSelection.css`
- `index.ts`

#### `features/department-selection/`
- `ui/DepartmentSpecialistsSelection.tsx` + `DepartmentSpecialistsSelection.css`
- `index.ts`

#### `features/date-time-selection/`
- `ui/DateTimeSelection.tsx` + `DateTimeSelection.css`
- `index.ts`

#### `features/phone-input/`
- `ui/PhoneInput.tsx` + `PhoneInput.css`
- `index.ts`

#### `features/appointment-details/`
- `ui/AppointmentDetails.tsx` + `AppointmentDetails.css`
- `index.ts`

#### `features/appointment-confirmation/`
- `ui/AppointmentConfirmation.tsx` + `AppointmentConfirmation.css`
- `index.ts`

#### `features/doctor-info/`
- `ui/DoctorInfo.tsx` + `DoctorInfo.css`
- `index.ts`

#### `features/pet-management/`
- `ui/AddPetModal.tsx` + `AddPetModal.css`
- `index.ts`

#### `features/next-steps/`
- `ui/NextSteps.tsx` + `NextSteps.css`
- `index.ts`

### 3. Обновление импортов

После перемещения компонентов нужно обновить импорты:

1. **В Widget.tsx:**
```typescript
// Было:
import BranchSelection from './BranchSelection';

// Стало:
import { BranchSelection } from '../../features/branch-selection';
```

2. **В WidgetProvider.tsx:**
```typescript
// Было:
import Widget from './Widget';
import StickyButton from './StickyButton';

// Стало:
import { Widget, StickyButton } from '../../widgets/appointment-widget';
```

3. **В index.ts (главный экспорт):**
```typescript
// Было:
export { default as Widget } from './components/Widget';
export { default as WidgetProvider } from './components/WidgetProvider';

// Стало:
export { Widget } from './widgets/appointment-widget';
export { default as WidgetProvider } from './app/providers/WidgetProvider';
```

### 4. Обновление путей к стилям

В CSS файлах нужно обновить пути к шрифтам:
```css
/* Было: */
@import '../styles/fonts.css';

/* Стало (для features): */
@import '../../../../styles/fonts.css';

/* Стало (для widgets): */
@import '../../../styles/fonts.css';
```

### 5. Использование констант и утилит

Обновить использование магических строк на константы:

```typescript
// Было:
if (currentStep === 'branch-selection') { ... }

// Стало:
import { WidgetStep } from '../../shared/constants';
if (currentStep === WidgetStep.BRANCH_SELECTION) { ... }
```

Использовать утилиты форматирования:
```typescript
// Было:
const fullName = `${employee.lastName} ${employee.firstName} ${employee.patronymic || ''}`.trim();

// Стало:
import { formatEmployeeFullName } from '../../shared/lib';
const fullName = formatEmployeeFullName(employee);
```

## Порядок миграции

1. ✅ Создать структуру shared (выполнено)
2. ✅ Создать WidgetProvider в app/providers (выполнено)
3. ✅ Создать StickyButton в widgets (выполнено)
4. ⏳ Переместить Widget в widgets/appointment-widget/ui
5. ⏳ Переместить все features компоненты
6. ⏳ Обновить все импорты
7. ⏳ Обновить использование констант и утилит
8. ⏳ Удалить старые файлы из src/components/
9. ⏳ Удалить старые файлы из src/lib/*-data.ts (заменить на shared/api)

## Пример структуры feature

```typescript
// features/branch-selection/ui/BranchSelection.tsx
import React from 'react';
import { Branch } from '../../../../types';
import { branchesApi } from '../../../../shared/api';
import './BranchSelection.css';

export interface BranchSelectionProps {
  branches: Branch[];
}

export const BranchSelection: React.FC<BranchSelectionProps> = ({ branches }) => {
  // ... компонент
};

// features/branch-selection/index.ts
export { BranchSelection } from './ui/BranchSelection';
export type { BranchSelectionProps } from './ui/BranchSelection';
```

## Примечания

- Все компоненты должны экспортироваться через `index.ts` в корне feature/widget
- Импорты должны быть относительными от текущего файла
- CSS файлы должны быть рядом с компонентами
- Использовать именованные экспорты вместо default для лучшей поддержки рефакторинга

