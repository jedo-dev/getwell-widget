import React from 'react';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, List } from 'antd';
import { Branch, Employee, Pet } from '../types';
import { getPetsSync } from '../lib/pets-data';
import { openGetWellWidget } from '../lib/widget-manager';
import './AppointmentConfirmation.css';

export interface AppointmentConfirmationProps {
  selectedBranch: Branch | null;
  selectedEmployee: Employee | null;
  selectedDateTime: string | null;
  phone: string | null;
  selectedPetId: number | null;
}

const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  selectedBranch,
  selectedEmployee,
  selectedDateTime,
  phone,
  selectedPetId,
}) => {
  const formatDate = (dateTime: string | null): { date: string; time: string } | null => {
    if (!dateTime) return null;

    const date = new Date(dateTime);
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const months = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return {
      date: `${dayName}, ${day} ${month}`,
      time: `${hours}:${minutes}`,
    };
  };

  const getSelectedPet = (): Pet | null => {
    if (!phone || !selectedPetId) return null;
    const pets = getPetsSync(phone);
    return pets.find((p) => p.id === selectedPetId) || null;
  };

  const dateTimeInfo = formatDate(selectedDateTime);
  const selectedPet = getSelectedPet();
  const fullName = selectedEmployee
    ? `${selectedEmployee.lastName} ${selectedEmployee.firstName} ${selectedEmployee.patronymic || ''}`.trim()
    : '';

  const handleAddToCalendar = () => {
    if (!selectedDateTime) return;
    // TODO: Реализовать добавление в календарь
    console.log('Добавить в календарь', selectedDateTime);
  };

  const handleBuildRoute = () => {
    if (!selectedBranch) return;
    // TODO: Реализовать построение маршрута
    const address = encodeURIComponent(selectedBranch.address);
    window.open(`https://yandex.ru/maps/?text=${address}`, '_blank');
  };

  const handleCall = () => {
    if (!selectedBranch) return;
    window.location.href = `tel:${selectedBranch.phone.replace(/[^\d+]/g, '')}`;
  };

  const handleBookAgain = () => {
    openGetWellWidget();
  };

  const appointmentItems = [
    selectedPet && {
      key: 'pet',
      icon: <span className="appointment-confirmation-paw-icon">🐾</span>,
      title: selectedPet.name,
      description: `${selectedPet.species || ''}${selectedPet.breed ? ` • ${selectedPet.breed}` : ''}`.trim(),
      action: null,
    },
    selectedEmployee && {
      key: 'employee',
      icon: <UserOutlined className="appointment-confirmation-item-icon" />,
      title: fullName,
      description: null,
      action: {
        text: 'Подробнее',
        onClick: () => {
          // TODO: Открыть модальное окно с информацией о враче
          console.log('Подробнее о враче');
        },
      },
    },
    dateTimeInfo && {
      key: 'datetime',
      icon: <CalendarOutlined className="appointment-confirmation-item-icon" />,
      title: `${dateTimeInfo.date}, ${dateTimeInfo.time}`,
      description: null,
      action: {
        text: 'Добавить в календарь',
        onClick: handleAddToCalendar,
      },
    },
    selectedBranch && {
      key: 'address',
      icon: <HomeOutlined className="appointment-confirmation-item-icon" />,
      title: selectedBranch.address,
      description: null,
      action: {
        text: 'Построить маршрут',
        onClick: handleBuildRoute,
      },
    },
    selectedBranch && {
      key: 'phone',
      icon: <PhoneOutlined className="appointment-confirmation-item-icon" />,
      title: selectedBranch.phone,
      description: null,
      action: {
        text: 'Позвонить',
        onClick: handleCall,
      },
    },
    selectedBranch && {
      key: 'schedule',
      icon: <ClockCircleOutlined className="appointment-confirmation-item-icon" />,
      title: selectedBranch.schedule,
      description: null,
      action: null,
    },
  ].filter(Boolean) as Array<{
    key: string;
    icon: React.ReactNode;
    title: string;
    description: string | null;
    action: { text: string; onClick: () => void } | null;
  }>;

  return (
    <div className="appointment-confirmation">
      <div className="appointment-confirmation-header">
        <h2 className="appointment-confirmation-title">Вы записаны на приём</h2>
        {dateTimeInfo && (
          <div className="appointment-confirmation-subtitle">
            {dateTimeInfo.date} • {dateTimeInfo.time}
          </div>
        )}
      </div>

      <div className="appointment-confirmation-content">
        <List
          dataSource={appointmentItems}
          renderItem={(item) => (
            <List.Item className="appointment-confirmation-item">
              <div className="appointment-confirmation-item-content">
                <div className="appointment-confirmation-item-left">
                  <div className="appointment-confirmation-item-icon-wrapper">{item.icon}</div>
                  <div className="appointment-confirmation-item-text">
                    <div className="appointment-confirmation-item-title">{item.title}</div>
                    {item.description && (
                      <div className="appointment-confirmation-item-description">{item.description}</div>
                    )}
                  </div>
                </div>
                {item.action && (
                  <button
                    className="appointment-confirmation-item-action"
                    onClick={item.action.onClick}
                  >
                    {item.action.text}
                  </button>
                )}
              </div>
            </List.Item>
          )}
        />
      </div>

      <div className="appointment-confirmation-footer">
        <Button
          type="primary"
          className="appointment-confirmation-book-again-btn"
          block
          onClick={handleBookAgain}
          size="large"
        >
          Записаться ещё
        </Button>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;

