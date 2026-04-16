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

// Session-level cache
const timechipCache = new Map<string, AvailableTimechip[]>();

function getCacheKey(key: TimechipCacheKey): string {
  return `${key.filialId}_${key.doctorId ?? 'null'}_${key.departmentId ?? 'null'}_${key.date}`;
}

interface UseTimechipsResult {
  timechips: AvailableTimechip[];
  loading: boolean;
  error: Error | null;
}

interface UseTimechipsOptions {
  includeDepartmentFilter?: boolean;
}

/**
 * Hook for loading timechips with caching.
 */
export function useTimechips(
  doctorId: number | null,
  enabled: boolean = true,
  date?: string | null, // YYYY-MM-DD HH:mm:ss - optional request date
  options?: UseTimechipsOptions,
): UseTimechipsResult {
  const [timechips, setTimechips] = useState<AvailableTimechip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const includeDepartmentFilter = options?.includeDepartmentFilter ?? true;

  useEffect(() => {
    if (!enabled || !doctorId) {
      setTimechips([]);
      setError(null);
      return;
    }

    const widgetState = getWidgetState();
    const apiUrl = widgetState.config?.apiUrl;
    const filialId = widgetState.selectedBranchId;
    const departmentId = includeDepartmentFilter
      ? widgetState.selectedDepartmentId ?? undefined
      : undefined;

    if (!apiUrl || !filialId || widgetState.config?.offlineMode) {
      setTimechips([]);
      setError(null);
      return;
    }

    // Use provided date or today's midnight in local time
    const requestDate = date || formatLocalMidnight(new Date());

    // Read cache
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

    // Load data
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
        // Save to cache
        timechipCache.set(key, data);
        setTimechips(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error loading timechips:', err);
        setError(err instanceof Error ? err : new Error('Failed to load timechips'));
        setTimechips([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [doctorId, enabled, date, includeDepartmentFilter]);

  return { timechips, loading, error };
}
