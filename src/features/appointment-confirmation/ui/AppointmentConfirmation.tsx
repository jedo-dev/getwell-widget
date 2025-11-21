import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { openGetWellWidget } from '../../../lib/widget-manager';
import { petsApi } from '../../../shared/api/pets';
import {
  formatDate,
  formatDateTime,
  formatEmployeeFullName,
  formatTime,
} from '../../../shared/lib';
import { Branch, Employee, Pet } from '../../../types';
import './AppointmentConfirmation.css';
export interface AppointmentConfirmationProps {
  selectedBranch: Branch | null;
  selectedEmployee: Employee | null;
  selectedDateTime: string | null;
  phone: string | null;
  selectedPetId: number | null;
}

export const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  selectedBranch,
  selectedEmployee,
  selectedDateTime,
  phone,
  selectedPetId,
}) => {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loadingPet, setLoadingPet] = useState<boolean>(false);
  const defaultImage = '';
  useEffect(() => {
    const loadPet = async () => {
      if (!phone || !selectedPetId) {
        setSelectedPet(null);
        return;
      }

      setLoadingPet(true);
      try {
        const pet = await petsApi.getById(selectedPetId);
        setSelectedPet(pet);
      } catch (error) {
        console.error('Ошибка загрузки питомца:', error);
      } finally {
        setLoadingPet(false);
      }
    };

    loadPet();
  }, [phone, selectedPetId]);

  const dateTimeInfo = formatDateTime(selectedDateTime);
  const fullName = selectedEmployee ? formatEmployeeFullName(selectedEmployee) : '';

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

  const dateTime = selectedDateTime ? new Date(selectedDateTime) : null;
  const formattedDate = dateTime ? formatDate(dateTime) : '';
  const formattedTime = dateTime ? formatTime(dateTime) : '';

  const appointmentItems = [
    selectedPet && {
      key: 'pet',
      icon: <span className='appointment-confirmation-paw-icon'>🐾</span>,
      title: selectedPet.name,
      description: null,
      action: {
        text: 'Подробнее',
        onClick: () => {
          // TODO: Открыть модальное окно с информацией о питомце
          console.log('Подробнее о питомце');
        },
      },
    },
    selectedEmployee && {
      key: 'employee',
      icon: <IdcardOutlined />,
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
      icon: <CalendarOutlined />,
      title: `${formattedDate}`,
      description: null,
      action: {
        text: 'Добавить в календарь',
        onClick: handleAddToCalendar,
      },
    },
    selectedBranch && {
      key: 'address',
      icon: <EnvironmentOutlined />,
      title: selectedBranch.address,
      description: null,
      action: {
        text: 'Построить маршрут',
        onClick: handleBuildRoute,
      },
    },
    selectedBranch && {
      key: 'phone',
      icon: <PhoneOutlined />,
      title: selectedBranch.phone,
      description: null,
      action: {
        text: 'Позвонить',
        onClick: handleCall,
      },
    },
    selectedBranch && {
      key: 'schedule',
      icon: <ClockCircleOutlined />,
      title: selectedBranch.schedule || 'Рабочие часы',
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
    <div className='appointment-confirmation'>
      {/* Main Image Container */}

      {/* Appointment Info Container */}
      <div className='appointment-confirmation-info-container'>
        <h2 className='appointment-confirmation-title'>Вы записаны на приём</h2>
        {dateTimeInfo && (
          <div className='appointment-confirmation-time-container'>
            <span className='appointment-confirmation-day'>{formattedDate}</span>
            <span className='appointment-confirmation-separator'>•</span>
            <span className='appointment-confirmation-time'>{formattedTime}</span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className='appointment-confirmation-details-container'>
        {loadingPet ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size='large' />
          </div>
        ) : (
          <div className='appointment-confirmation-details-list'>
            {appointmentItems.map((item) => (
              <div key={item.key} className='appointment-confirmation-detail-item'>
                <div className='appointment-confirmation-detail-content'>
                  <div className='appointment-confirmation-detail-icon'>{item.icon}</div>
                  <div className='appointment-confirmation-detail-text'>
                    <div className='appointment-confirmation-detail-title'>{item.title}</div>
                  </div>
                  {item.action && (
                    <button
                      className='appointment-confirmation-detail-action'
                      onClick={item.action.onClick}>
                      {item.action.text}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='appointment-confirmation-footer'>
        <Button
          type='primary'
          className='appointment-confirmation-book-again-btn'
          block
          onClick={handleBookAgain}
          size='large'>
          Записаться ещё
        </Button>
      </div>
    </div>
  );
};
