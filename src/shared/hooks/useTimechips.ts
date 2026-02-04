import { useEffect, useState } from 'react';
import { schedulesApi, AvailableTimechip } from '../api/schedules';
import { formatLocalMidnight } from '../lib';
import { getWidgetState } from '../../lib/widget-manager';

interface TimechipCacheKey {
  filialId: number;
  doctorId?: number;
  departmentId?: number;
  date: string;
}

// Кэш на уровне сессии
const timechipCache = new Map<string, AvailableTimechip[]>();

function getCacheKey(key: TimechipCacheKey): string {
  return `${key.filialId}_${key.doctorId ?? 'null'}_${key.departmentId ?? 'null'}_${key.date}`;
}

interface UseTimechipsResult {
  timechips: AvailableTimechip[];
  loading: boolean;
  error: Error | null;
}

/**
 * Хук для загрузки timechips с кэшированием
 */
export function useTimechips(
  doctorId: number | null,
  enabled: boolean = true,
  date?: string | null, // YYYY-MM-DD HH:mm:ss - опциональная дата для запроса
): UseTimechipsResult {
  const [timechips, setTimechips] = useState<AvailableTimechip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !doctorId) {
      setTimechips([]);
      setError(null);
      return;
    }

    const widgetState = getWidgetState();
    const apiUrl = widgetState.config?.apiUrl;
    const filialId = widgetState.selectedBranchId;
    const departmentId = widgetState.selectedDepartmentId ?? undefined;

    if (!apiUrl || !filialId || widgetState.config?.offlineMode) {
      setTimechips([]);
      setError(null);
      return;
    }

    // Используем переданную дату или формируем дату на сегодня в 00:00:00
    const requestDate = date || formatLocalMidnight(new Date());

    // Проверяем кэш
    const cacheKey: TimechipCacheKey = {
      filialId,
      doctorId,
      departmentId,
      date: requestDate,
    };
    const key = getCacheKey(cacheKey);
    const cached = timechipCache.get(key);

    if (cached) {
      setTimechips(cached);
      setError(null);
      return;
    }

    // Загружаем данные
    setLoading(true);
    setError(null);

    schedulesApi
      .getAvailableTimechips({
        apiUrl,
        filialId,
        appointmentTypeId: 8,
        date: requestDate,
        doctorId,
        departmentId,
      })
      .then((data) => {
        // Кэшируем результат
        timechipCache.set(key, data);
        setTimechips(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Ошибка загрузки timechips:', err);
        setError(err instanceof Error ? err : new Error('Failed to load timechips'));
        setTimechips([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [doctorId, enabled, date]);

  return { timechips, loading, error };
}
