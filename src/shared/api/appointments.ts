import { Appointment, TimeSlot } from '../../types';
import { AppointmentType } from '../constants/appointment-types';
import {
  AppointmentResponse,
  CreateAppointmentRequest,
  GetTimeSlotsRequest,
  TimeSlotsResponse,
} from '../types/api';

/**
 * Моковые данные слотов времени
 */
function generateMockTimeSlots(date: string): TimeSlot[] {
  const baseDate = new Date(date);
  const slots: TimeSlot[] = [];

  // Генерируем слоты с 9:00 до 20:00 с интервалом 30 минут
  for (let hour = 9; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotDate = new Date(baseDate);
      slotDate.setHours(hour, minute, 0, 0);

      // Пропускаем некоторые слоты для реалистичности
      if (Math.random() > 0.3) {
        slots.push({
          datetime: slotDate.toISOString(),
          duration: 30,
          appointmentType: AppointmentType.CONSULTATION,
        });
      }
    }
  }

  return slots;
}

/**
 * API для работы с записями
 */
export const appointmentsApi = {
  /**
   * Получить доступные слоты времени
   */
  async getTimeSlots(request: GetTimeSlotsRequest): Promise<TimeSlotsResponse> {
    // В реальной реализации:
    // return await apiClient.get<TimeSlotsResponse>(
    //   `/branches/${request.branchId}/time-slots?date=${request.date}&employeeId=${request.employeeId || ''}&departmentId=${request.departmentId || ''}`
    // );

    // Моковая реализация
    const slots = generateMockTimeSlots(request.date);
    return {
      data: slots,
      success: true,
    };
  },

  /**
   * Создать запись на прием
   */
  async create(request: CreateAppointmentRequest): Promise<AppointmentResponse> {
    // В реальной реализации:
    // return await apiClient.post<AppointmentResponse>('/appointments', request);

    // Моковая реализация
    const appointment: Appointment = {
      branchId: request.branchId,
      employeeId: request.employeeId,
      departmentId: request.departmentId,
      client: request.client as any,
      pet: request.pet as any,
      timeSlot: request.timeSlot,
      notes: request.notes,
      appointmentType: request.timeSlot.appointmentType,
    };

    return {
      data: appointment,
      success: true,
      message: 'Запись успешно создана',
    };
  },

  /**
   * Получить запись по ID
   */
  async getById(id: number): Promise<Appointment | null> {
    // В реальной реализации:
    // return await apiClient.get<Appointment>(`/appointments/${id}`);

    // Моковая реализация
    return null;
  },
};
