import { CalendarOutlined, LeftOutlined, UserOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useMemo, useState } from 'react';
import { goBack, goToPhoneInput, selectDateTime } from '../lib/widget-manager';
import { Employee } from '../types';
import './DateTimeSelection.css';

export interface DateTimeSelectionProps {
  selectedEmployee: Employee | null;
}

type TimePeriod = 'morning' | 'day' | 'evening';

interface TimeSlot {
  time: string;
  period: TimePeriod;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ selectedEmployee }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handleBack = () => {
    goBack();
  };

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

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isCurrentMonth = (date: Date | null): boolean => {
    if (!date) return false;
    return date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear();
  };

  // Временные слоты (заглушка, в будущем из API)
  const timeSlots: TimeSlot[] = useMemo(() => {
    // TODO: В будущем здесь будет запрос к API для получения доступных слотов
    return [
      { time: '11:00', period: 'morning' },
      { time: '12:30', period: 'day' },
      { time: '14:00', period: 'day' },
      { time: '15:30', period: 'day' },
      { time: '17:30', period: 'day' },
      { time: '18:00', period: 'evening' },
      { time: '18:30', period: 'evening' },
      { time: '20:00', period: 'evening' },
    ];
  }, [selectedDate]);

  const groupedTimeSlots = useMemo(() => {
    const grouped: Record<TimePeriod, TimeSlot[]> = {
      morning: [],
      day: [],
      evening: [],
    };

    timeSlots.forEach(slot => {
      grouped[slot.period].push(slot);
    });

    return grouped;
  }, [timeSlots]);

  const getPeriodLabel = (period: TimePeriod): string => {
    const labels = {
      morning: 'Утро',
      day: 'День',
      evening: 'Вечер',
    };
    return labels[period];
  };

  const formatDate = (date: Date): string => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${dayName}, ${day} ${month}`;
  };

  const formatMonthYear = (date: Date): string => {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return `${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const fullName = selectedEmployee
    ? `${selectedEmployee.lastName} ${selectedEmployee.firstName} ${selectedEmployee.patronymic || ''}`.trim()
    : '';

  return (
    <div className="date-time-selection">
      <div className="date-time-selection-header">
        <LeftOutlined className="date-time-selection-back" onClick={handleBack} />
        <h2 className="date-time-selection-title">Выберите дату и время</h2>
      </div>

      {selectedEmployee && (
        <div className="date-time-selection-doctor-card">
          <div className="date-time-selection-doctor-left">
            <div className="date-time-selection-doctor-avatar">
              {selectedEmployee.photo ? (
                <img src={selectedEmployee.photo} alt={fullName} />
              ) : (
                <UserOutlined />
              )}
            </div>
            <div className="date-time-selection-doctor-info">
              <div className="date-time-selection-doctor-name">{fullName}</div>
              <div className="date-time-selection-doctor-specialization">
                {selectedEmployee.specialization}
              </div>
            </div>
          </div>
          {selectedDate && selectedTime && (
            <div className="date-time-selection-doctor-right">
              <CalendarOutlined className="date-time-selection-calendar-icon" />
              <div className="date-time-selection-selected-info">
                <div className="date-time-selection-selected-date">
                  {formatDate(selectedDate)}
                </div>
                <div className="date-time-selection-selected-time">{selectedTime}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="date-time-selection-content">
        <div className="date-time-selection-calendar">
          <div className="date-time-selection-calendar-header">
            <button
              className="date-time-selection-calendar-nav"
              onClick={handlePrevMonth}
            >
              &lt;
            </button>
            <div className="date-time-selection-calendar-month">
              {formatMonthYear(currentMonth)}
            </div>
            <button
              className="date-time-selection-calendar-nav"
              onClick={handleNextMonth}
            >
              &gt;
            </button>
          </div>

          <div className="date-time-selection-calendar-weekdays">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="date-time-selection-calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="date-time-selection-calendar-days">
            {calendarDays.map((date, index) => {
              if (!date) return <div key={index} className="date-time-selection-calendar-day empty" />;

              const isPast = isPastDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
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
                  onClick={() => !isPast && isCurrentMonthDay && handleDateSelect(date)}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        <div className="date-time-selection-times">
          {(Object.keys(groupedTimeSlots) as TimePeriod[]).map(period => {
            if (groupedTimeSlots[period].length === 0) return null;

            return (
              <div key={period} className="date-time-selection-time-group">
                <div className="date-time-selection-time-group-label">
                  {getPeriodLabel(period)}
                </div>
                <div className="date-time-selection-time-group-slots">
                  {groupedTimeSlots[period].map(slot => (
                    <button
                      key={slot.time}
                      className={`date-time-selection-time-slot 
                        ${selectedTime === slot.time ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(slot.time)}
                    >
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
        <div className="date-time-selection-footer">
          <Button
            type="primary"
            className="date-time-selection-next-btn"
            block
            onClick={goToPhoneInput}
          >
            Далее
          </Button>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
