import {
  CalendarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, List, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { openGetWellWidget } from '../../../lib/widget-manager';
import { petsApi } from '../../../shared/api/pets';
import { formatDateTime, formatEmployeeFullName } from '../../../shared/lib';
import { InfoListItem } from '../../../shared/ui';
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

  const appointmentItems = [
    selectedPet && {
      key: 'pet',
      icon: <span className='appointment-confirmation-paw-icon'>🐾</span>,
      title: selectedPet.name,
      description: `${selectedPet.species || ''}${
        selectedPet.breed ? ` • ${selectedPet.breed}` : ''
      }`.trim(),
      action: null,
    },
    selectedEmployee && {
      key: 'employee',
      icon: <UserOutlined className='appointment-confirmation-item-icon' />,
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
      icon: <CalendarOutlined className='appointment-confirmation-item-icon' />,
      title: `${dateTimeInfo.date}, ${dateTimeInfo.time}`,
      description: null,
      action: {
        text: 'Добавить в календарь',
        onClick: handleAddToCalendar,
      },
    },
    selectedBranch && {
      key: 'address',
      icon: <HomeOutlined className='appointment-confirmation-item-icon' />,
      title: selectedBranch.address,
      description: null,
      action: {
        text: 'Построить маршрут',
        onClick: handleBuildRoute,
      },
    },
    selectedBranch && {
      key: 'phone',
      icon: <PhoneOutlined className='appointment-confirmation-item-icon' />,
      title: selectedBranch.phone,
      description: null,
      action: {
        text: 'Позвонить',
        onClick: handleCall,
      },
    },
    selectedBranch && {
      key: 'schedule',
      icon: <ClockCircleOutlined className='appointment-confirmation-item-icon' />,
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
    <div className='appointment-confirmation'>
      <div className='appointment-confirmation-header'>
        <h2 className='appointment-confirmation-title'>Вы записаны на приём</h2>
        {dateTimeInfo && (
          <div className='appointment-confirmation-subtitle'>
            {dateTimeInfo.date} • {dateTimeInfo.time}
          </div>
        )}
      </div>

      <div className='appointment-confirmation-content'>
        {loadingPet ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size='large' />
          </div>
        ) : (
          <List
            dataSource={appointmentItems}
            renderItem={(item) => (
              <List.Item className='appointment-confirmation-item'>
                <InfoListItem
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  action={item.action}
                />
              </List.Item>
            )}
          />
        )}
      </div>

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
