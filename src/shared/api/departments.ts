import { DepartmentsResponse } from '../types/api';
import { getWidgetSettings } from './widget-settings-cache';

/**
 * API для работы с отделениями
 */
export const departmentsApi = {
  /**
   * Получить список отделений филиала
   */
  async getByBranch(branchId?: number): Promise<DepartmentsResponse> {
    try {
      const settings = await getWidgetSettings();
      if (settings.status !== 'ok') {
        return {
          data: [],
          success: false,
          message: settings.reason || 'Failed to fetch departments',
        };
      }

      let departments = (settings.data.departments || []).map((dept) => ({
        id: dept.id,
        name: dept.name,
        filialId: dept.filial.id,
        showInWidget: true,
      }));

      // Если указан branchId, фильтруем по филиалу
      if (branchId) {
        departments = departments.filter((dept) => {
          const departmentData = settings.data.departments.find((d) => d.id === dept.id);
          return departmentData?.filial.id === branchId;
        });
      }

      return {
        data: departments,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching departments:', error);
      return {
        data: [],
        success: false,
        message:
          error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'Failed to fetch departments',
      };
    }
  },

  /**
   * Получить отделение по ID
   */
};
