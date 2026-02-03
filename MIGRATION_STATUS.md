# Статус миграции на FSD

## ✅ Выполнено

### Shared слой
- ✅ Константы и ENUM'ы (`shared/constants/`)
- ✅ Утилиты (`shared/lib/`)
- ✅ Типы для API (`shared/types/`)
- ✅ Моковый API (`shared/api/`)

### App слой
- ✅ `app/providers/WidgetProvider.tsx`

### Widgets слой
- ✅ `widgets/appointment-widget/ui/Widget.tsx` - обновлен с использованием констант
- ✅ `widgets/appointment-widget/ui/StickyButton.tsx`

### Features слой
- ✅ `features/branch-selection/` - полностью мигрирован
- ✅ `features/next-steps/` - полностью мигрирован
- ✅ `features/phone-input/` - полностью мигрирован с использованием утилит
- ✅ `features/doctor-info/` - полностью мигрирован с использованием утилит
- ✅ `features/department-selection/` - полностью мигрирован с использованием утилит
- ✅ `features/specialist-selection/` - полностью мигрирован с использованием констант
- ✅ `features/date-time-selection/` - полностью мигрирован с использованием констант и утилит
- ✅ `features/pet-management/` - AddPetModal мигрирован с использованием констант
- ✅ `features/appointment-details/` - полностью мигрирован с использованием Gender, PetSpecies, formatPhone, formatDateTime
- ✅ `features/appointment-confirmation/` - полностью мигрирован с использованием formatDateTime, formatEmployeeFullName

## ✅ Завершено

Все компоненты успешно мигрированы в структуру FSD!

## 📝 Паттерн миграции

Для каждого компонента:

1. **Создать структуру:**
   ```
   features/feature-name/
     ui/
       ComponentName.tsx
       ComponentName.css
     index.ts
   ```

2. **Обновить импорты:**
   - Использовать относительные пути от нового расположения
   - Импортировать из `shared/lib` для утилит
   - Импортировать из `shared/constants` для констант

3. **Использовать константы:**
   ```typescript
   // Было:
   if (currentStep === 'branch-selection')
   
   // Стало:
   import { WidgetStep } from '../../../shared/constants';
   if (currentStep === WidgetStep.BRANCH_SELECTION)
   ```

4. **Использовать утилиты:**
   ```typescript
   // Было:
   const fullName = `${employee.lastName} ${employee.firstName}...`.trim();
   
   // Стало:
   import { formatEmployeeFullName } from '../../../shared/lib';
   const fullName = formatEmployeeFullName(employee);
   ```

5. **Экспортировать через index.ts:**
   ```typescript
   export { ComponentName } from './ui/ComponentName';
   export type { ComponentNameProps } from './ui/ComponentName';
   ```

6. **Обновить импорты в Widget.tsx:**
   ```typescript
   import { ComponentName } from '../../../features/feature-name';
   ```

## 🎯 Следующие шаги

1. Продолжить миграцию оставшихся features по паттерну выше
2. Обновить главный `src/index.ts` для экспорта из новой структуры
3. Удалить старые файлы из `src/components/` после полной миграции
4. Заменить использование `lib/*-data.ts` на `shared/api/*`

