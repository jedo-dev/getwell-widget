import { useEffect, useState } from 'react';
import { getWidgetState } from '../../lib/widget-manager';
import { GenderItem, patientsApi } from '../api/patients';
import { Gender, PET_GENDER_LABELS } from '../constants/gender';

// Кэш на уровне сессии
const gendersCache = new Map<string, GenderItem[]>();

interface UsePetGendersResult {
  genders: GenderItem[];
  loading: boolean;
  error: Error | null;
  getLabel: (code: string) => string;
}

/**
 * Хук для загрузки полов питомцев с бекенда с кэшированием
 */
export function usePetGenders(enabled: boolean = true): UsePetGendersResult {
  const [genders, setGenders] = useState<GenderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const widgetState = getWidgetState();
    const apiUrl = widgetState.config?.apiUrl;

    if (!apiUrl || widgetState.config?.offlineMode) {
      // В офлайн режиме используем дефолтные значения из констант
      const defaultGenders: GenderItem[] = [
        { code: Gender.MALE, name: PET_GENDER_LABELS[Gender.MALE] },
        { code: Gender.FEMALE, name: PET_GENDER_LABELS[Gender.FEMALE] },
      ];
      setGenders(defaultGenders);
      setError(null);
      return;
    }

    // Проверяем кэш
    const cached = gendersCache.get(apiUrl);
    if (cached) {
      setGenders(cached);
      setError(null);
      return;
    }

    // Загружаем данные
    setLoading(true);
    setError(null);

    patientsApi
      .getGenders(apiUrl)
      .then((data: GenderItem[]) => {
        // Используем данные с бекенда напрямую
        gendersCache.set(apiUrl, data);
        setGenders(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Ошибка загрузки полов питомцев:', err);
        setError(err instanceof Error ? err : new Error('Failed to load pet genders'));
        // При ошибке используем дефолтные значения
        const defaultGenders: GenderItem[] = [
          { code: Gender.MALE, name: PET_GENDER_LABELS[Gender.MALE] },
          { code: Gender.FEMALE, name: PET_GENDER_LABELS[Gender.FEMALE] },
        ];
        setGenders(defaultGenders);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enabled]);

  // Функция для получения лейбла по кодусду
  const getLabel = (code: string): string => {
    const gender = genders.find((g) => g.code === code);
    if (gender) {
      return gender.name;
    }
    // Fallback на дефолтные значения
    if (code === Gender.MALE) {
      return PET_GENDER_LABELS[Gender.MALE];
    }
    if (code === Gender.FEMALE) {
      return PET_GENDER_LABELS[Gender.FEMALE];
    }
    return code;
  };

  return { genders, loading, error, getLabel };
}
