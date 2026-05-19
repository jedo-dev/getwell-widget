import { useEffect, useState } from 'react';
import { schedulesApi, AvailableTimechip } from '../api/schedules';
import { formatLocalMidnight } from '../lib';
import { getWidgetState } from '../../lib/widget-manager';

interface UseTimechipsResult {
  timechips: AvailableTimechip[];
  loading: boolean;
  error: Error | null;
}

interface UseTimechipsOptions {
  includeDepartmentFilter?: boolean;
}

/**
 * Hook for loading timechips.
 * Always requests fresh data to avoid showing outdated near-time slots.
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
