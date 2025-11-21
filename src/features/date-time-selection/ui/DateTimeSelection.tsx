import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useMemo, useState } from 'react';
import { getWidgetState, goToPhoneInput, selectDateTime } from '../../../lib/widget-manager';
import { DAYS_OF_WEEK_SHORT, TIME_PERIOD_LABELS, TimePeriod } from '../../../shared/constants';
import {
  formatDate,
  formatEmployeeFullName,
  formatMonthYear,
  isCurrentMonth,
  isPastDate,
  isToday,
} from '../../../shared/lib';
import { Avatar } from '../../../shared/ui';
import { Employee } from '../../../types';
import './DateTimeSelection.css';

export interface DateTimeSelectionProps {
  selectedEmployee: Employee | null;
}

interface TimeSlot {
  time: string;
  period: TimePeriod;
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ selectedEmployee }) => {
  const widgetState = getWidgetState();
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    const dateTime = `${selectedDate.toISOString().split('T')[0]}T${time}:00`;
    selectDateTime(dateTime);
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

  // Временные слоты (заглушка, в будущем из API)
  const timeSlots: TimeSlot[] = useMemo(() => {
    // TODO: В будущем здесь будет запрос к API для получения доступных слотов
    return [
      { time: '11:00', period: TimePeriod.MORNING },
      { time: '12:30', period: TimePeriod.DAY },
      { time: '14:00', period: TimePeriod.DAY },
      { time: '15:30', period: TimePeriod.DAY },
      { time: '17:30', period: TimePeriod.DAY },
      { time: '18:00', period: TimePeriod.EVENING },
      { time: '18:30', period: TimePeriod.EVENING },
      { time: '20:00', period: TimePeriod.EVENING },
    ];
  }, [selectedDate]);

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
                <CalendarOutlined className='date-time-selection-calendar-icon' />
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
                        ${selectedTime === slot.time ? 'selected' : ''}`}
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
