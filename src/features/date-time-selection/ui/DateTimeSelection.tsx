import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  getWidgetState,
  goToPhoneInput,
  selectDateTime,
  selectDepartmentOnly,
  setReservedTimeslotHash,
} from '../../../lib/widget-manager';
import { schedulesApi } from '../../../shared/api/schedules';
import { DAYS_OF_WEEK_SHORT, TIME_PERIOD_LABELS, TimePeriod } from '../../../shared/constants';
import {
  formatDate,
  formatEmployeeFullName,
  formatLocalDateTime,
  formatLocalMidnight,
  formatMonthYear,
  isCurrentMonth,
  isPastDate,
  isToday,
} from '../../../shared/lib';
import { Avatar, Notification } from '../../../shared/ui';
import { Employee } from '../../../types';
import './DateTimeSelection.css';

import CalendarIcon from '../../../img/calendar.svg';
import IconWrapper from '../../../shared/ui/IconWrapper';

export interface DateTimeSelectionProps {
  selectedEmployee: Employee | null;
}

interface TimeSlot {
  time: string;
  period: TimePeriod;
  fromIso: string;
  toIso: string;
  isLimited?: boolean;
  departmentId?: number;
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ selectedEmployee }) => {
  const widgetState = getWidgetState();
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [apiSlots, setApiSlots] = useState<TimeSlot[]>([]);
  const [notification, setNotification] = useState<{ message: string } | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = async (time: string) => {
    setSelectedTime(time);
    const slot = apiSlots.find((s) => s.time === time);
    if (slot) {
      // Сохраняем department_id из слота, если он есть
      if (slot.departmentId) {
        selectDepartmentOnly(slot.departmentId);
      }

      selectDateTime(slot.fromIso, slot.toIso);

      // Резервируем слот на 5 минут

      if (widgetState.config?.apiUrl && widgetState.selectedDepartmentId && selectedEmployee?.id) {
        try {
          // Преобразуем ISO строки обратно в локальный формат "YYYY-MM-DD HH:mm:ss"
          const fromLocal = formatLocalDateTime(new Date(slot.fromIso));
          const toLocal = formatLocalDateTime(new Date(slot.toIso));

          const result = await schedulesApi.reserveTimeslot({
            apiUrl: widgetState.config.apiUrl,
            timeslot: {
              from: fromLocal,
              to: toLocal,
            },
            departmentId: widgetState.selectedDepartmentId,
            employeeId: selectedEmployee.id,
            uniqueHash: widgetState.reservedTimeslotHash || undefined,
          });

          // Сохраняем unique_hash
          if (result.unique_hash) {
            setReservedTimeslotHash(result.unique_hash);
          }
        } catch (error: any) {
          console.error('Ошибка резервирования слота:', error);
          // Проверяем различные варианты ошибки duplicate_entry
          const isDuplicate =
            error.code === 'DUPLICATE_ENTRY' ||
            error.message === 'duplicate_entry' ||
            error.message?.includes('duplicate_entry') ||
            (error.details &&
              typeof error.details === 'object' &&
              error.details.reason === 'duplicate_entry');

          if (isDuplicate) {
            setNotification({ message: 'Время уже занято. Пожалуйста, выберите другое время.' });
            setSelectedTime(null);
            // Отменяем выбор времени в состоянии виджета
            selectDateTime(null, null);
            return;
          }
          // Продолжаем выполнение даже при другой ошибке резервирования
          return;
        }
      }
    }
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  // Генерация календаря
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Понедельник = 0

    const days: (Date | null)[] = [];

    // Дни предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Дни следующего месяца
    const remainingDays = 42 - days.length; // 6 недель * 7 дней
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [currentMonth]);

  const isSelected = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  // Преобразуем "YYYY-MM-DD HH:mm:ss" (локальное время) -> ISO строка
  const localDateTimeToIso = (dt: string): string => {
    const [datePart, timePart] = dt.split(' ');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm, ss] = timePart.split(':').map(Number);
    const local = new Date(y, m - 1, d, hh, mm, ss || 0, 0);
    return local.toISOString();
  };

  const getPeriod = (hours: number): TimePeriod => {
    if (hours < 12) return TimePeriod.MORNING;
    if (hours < 18) return TimePeriod.DAY;
    return TimePeriod.EVENING;
  };

  // Загружаем слоты из API
  useEffect(() => {
    const load = async () => {
      // Офлайн режим: здесь можно будет брать слоты из конфига,
      // но в текущей задаче подключаем только новые ендпоинты.
      if (widgetState.config?.offlineMode) {
        setApiSlots([]);
        return;
      }

      if (!widgetState.config?.apiUrl) {
        setApiSlots([]);
        return;
      }

      if (!widgetState.selectedBranchId) {
        setApiSlots([]);
        return;
      }

      // По сваггеру date обязателен в формате "YYYY-MM-DD HH:mm:ss"
      // Используем formatLocalMidnight для форматирования полночи выбранной даты в локальной таймзоне
      const date = formatLocalMidnight(selectedDate);

      setLoadingSlots(true);
      try {
        const timechips = await schedulesApi.getAvailableTimechips({
          apiUrl: widgetState.config.apiUrl,
          filialId: widgetState.selectedBranchId,
          appointmentTypeId: 8,
          date,
          doctorId: selectedEmployee?.id || undefined,
          departmentId: widgetState.selectedDepartmentId || undefined,
        });

        const slots: TimeSlot[] = (timechips || []).map((t) => {
          // from: "YYYY-MM-DD HH:mm:ss"
          const isoFrom = localDateTimeToIso(t.from);
          const isoTo = localDateTimeToIso(t.to);
          const fromDate = new Date(isoFrom);
          const hh = String(fromDate.getHours()).padStart(2, '0');
          const mm = String(fromDate.getMinutes()).padStart(2, '0');
          return {
            time: `${hh}:${mm}`,
            period: getPeriod(fromDate.getHours()),
            fromIso: isoFrom,
            toIso: isoTo,
            isLimited: t.is_limited,
            departmentId: t.department_id,
          };
        });

        // Сортировка по времени
        slots.sort((a, b) => a.fromIso.localeCompare(b.fromIso));
        setApiSlots(slots);
      } catch (e) {
        console.error('Ошибка загрузки слотов времени:', e);
        setApiSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedDate,
    selectedEmployee?.id,
    widgetState.selectedBranchId,
    widgetState.selectedDepartmentId,
    widgetState.config?.apiUrl,
    widgetState.config?.offlineMode,
  ]);

  const timeSlots: TimeSlot[] = useMemo(() => {
    return apiSlots;
  }, [apiSlots]);

  const groupedTimeSlots = useMemo(() => {
    const grouped: Record<TimePeriod, TimeSlot[]> = {
      [TimePeriod.MORNING]: [],
      [TimePeriod.DAY]: [],
      [TimePeriod.EVENING]: [],
    };

    timeSlots.forEach((slot) => {
      grouped[slot.period].push(slot);
    });

    return grouped;
  }, [timeSlots]);

  const fullName = formatEmployeeFullName(selectedEmployee);

  return (
    <div className='date-time-selection'>
      {notification && (
        <Notification
          message={notification.message}
          type='error'
          duration={5000}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Specialist Info Card */}
      {selectedEmployee && (
        <div className='date-time-selection-doctor-card'>
          <div className='date-time-selection-doctor-left'>
            <Avatar
              src={selectedEmployee.photo}
              alt={fullName}
              size='medium'
              className='date-time-selection-doctor-avatar'
            />
            <div className='date-time-selection-doctor-info'>
              <div className='date-time-selection-doctor-name'>{fullName}</div>
              {showEmployeePosition && (
                <div className='date-time-selection-doctor-specialization'>
                  {selectedEmployee.specialization}
                </div>
              )}
            </div>
          </div>
          {selectedDate && selectedTime && (
            <div className='date-time-selection-doctor-right'>
              <div className='date-time-selection-calendar-icon-wrapper'>
                <IconWrapper src={CalendarIcon} />
              </div>
              <div className='date-time-selection-selected-info'>
                <div className='date-time-selection-selected-date'>{formatDate(selectedDate)}</div>
                <div className='date-time-selection-selected-time'>{selectedTime}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className='date-time-selection-content'>
        <div className='date-time-selection-calendar'>
          <div className='date-time-selection-calendar-header'>
            <div className='date-time-selection-calendar-month'>
              {formatMonthYear(currentMonth)}
            </div>
            <div className='date-time-selection-calendar-nav-group'>
              <button className='date-time-selection-calendar-nav' onClick={handlePrevMonth}>
                <LeftOutlined />
              </button>
              <button className='date-time-selection-calendar-nav' onClick={handleNextMonth}>
                <RightOutlined />
              </button>
            </div>
          </div>

          <div className='date-time-selection-calendar-weekdays'>
            {DAYS_OF_WEEK_SHORT.map((day: string) => (
              <div key={day} className='date-time-selection-calendar-weekday'>
                {day}
              </div>
            ))}
          </div>

          <div className='date-time-selection-calendar-days'>
            {calendarDays.map((date, index) => {
              if (!date)
                return <div key={index} className='date-time-selection-calendar-day empty' />;

              const isPast = isPastDate(date);
              const isCurrentMonthDay = isCurrentMonth(date, currentMonth);
              const isSelectedDay = isSelected(date);
              const isTodayDay = isToday(date);

              return (
                <div
                  key={index}
                  className={`date-time-selection-calendar-day 
                    ${!isCurrentMonthDay ? 'other-month' : ''} 
                    ${isPast ? 'past' : ''} 
                    ${isSelectedDay ? 'selected' : ''} 
                    ${isTodayDay ? 'today' : ''}`}
                  onClick={() => !isPast && isCurrentMonthDay && handleDateSelect(date)}>
                  <span className='date-time-selection-calendar-day-number'>{date.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className='date-time-selection-times'>
          {loadingSlots && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <Spin size='large' />
            </div>
          )}

          {(Object.keys(groupedTimeSlots) as TimePeriod[]).map((period) => {
            if (groupedTimeSlots[period].length === 0) return null;

            return (
              <div key={period} className='date-time-selection-time-group'>
                <div className='date-time-selection-time-group-label'>
                  {TIME_PERIOD_LABELS[period]}
                </div>
                <div className='date-time-selection-time-group-slots'>
                  {groupedTimeSlots[period].map((slot) => (
                    <button
                      key={slot.time}
                      className={`date-time-selection-time-slot 
                        ${selectedTime === slot.time ? 'selected' : ''}
                        ${slot.isLimited ? 'disabled' : ''}`}
                      disabled={slot.isLimited}
                      onClick={() => handleTimeSelect(slot.time)}>
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTime && (
        <div className='date-time-selection-footer'>
          <Button
            type='primary'
            className='date-time-selection-next-btn'
            block
            onClick={goToPhoneInput}>
            Далее
          </Button>
        </div>
      )}
    </div>
  );
};
