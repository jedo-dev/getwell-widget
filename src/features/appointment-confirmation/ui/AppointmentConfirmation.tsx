import { Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { getWidgetState, openGetWellWidget } from '../../../lib/widget-manager';
import { branchesApi } from '../../../shared/api';
import { petsApi } from '../../../shared/api/pets';
import {
  formatDate,
  formatDateTime,
  formatEmployeeFullName,
  formatTime,
} from '../../../shared/lib';
import IconWrapper from '../../../shared/ui/IconWrapper';
import { Branch, Employee, Pet } from '../../../types';
import './AppointmentConfirmation.css';


import LocationIcon from '../../../img/confirmation-icon/addres.svg';
import CalendarIcon from '../../../img/confirmation-icon/calendar.svg';
import UserIcon from '../../../img/confirmation-icon/doctor.svg';
import mobileIcon from '../../../img/confirmation-icon/mobile.svg';
import watchIcon from '../../../img/confirmation-icon/watch.svg';
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
  const widgetState = getWidgetState();
  const showDoctorInfo = widgetState.config?.showDoctorInfo ?? true;
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [resolvedBranch, setResolvedBranch] = useState<Branch | null>(selectedBranch);
  const [loadingPet, setLoadingPet] = useState<boolean>(false);

  useEffect(() => {
    setResolvedBranch(selectedBranch);

    const loadBranchDetails = async () => {
      if (!selectedBranch?.id) {
        return;
      }

      if (selectedBranch.phone && selectedBranch.schedule) {
        return;
      }

      try {
        const branchDetails = await branchesApi.getById(selectedBranch.id);
        if (branchDetails) {
          setResolvedBranch({ ...selectedBranch, ...branchDetails });
        }
      } catch (error) {
        console.error('Ошибка загрузки филиала для подтверждения:', error);
      }
    };

    loadBranchDetails();
  }, [selectedBranch]);

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
    if (!resolvedBranch) return;
    // TODO: Реализовать построение маршрута
    const address = encodeURIComponent(resolvedBranch.address);
    window.open(`https://yandex.ru/maps/?text=${address}`, '_blank');
  };

  const handleCall = () => {
    if (!resolvedBranch?.phone) return;
    window.location.href = `tel:${resolvedBranch.phone.replace(/[^\d+]/g, '')}`;
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
      icon: <IconWrapper src={UserIcon} size={32} iconSize={16} style={{ border: '1px solid var(--widget-border-secondary)' }} />,
      title: fullName,
      description: null,
      action: showDoctorInfo ? {
        text: 'Подробнее',
        onClick: () => {
          // TODO: Открыть модальное окно с информацией о враче
          console.log('Подробнее о враче');
        },
      } : null,
    },
    dateTimeInfo && {
      key: 'datetime',
      icon: <IconWrapper src={CalendarIcon} size={32} iconSize={16} style={{ border: '1px solid var(--widget-border-secondary)' }} />,
      title: `${formattedDate}`,
      description: null,
      action: {
        text: 'Добавить в календарь',
        onClick: handleAddToCalendar,
      },
    },
    resolvedBranch && {
      key: 'address',
      icon: <IconWrapper src={LocationIcon} size={32} iconSize={16} style={{ border: '1px solid var(--widget-border-secondary)' }} />,
      title: resolvedBranch.address,
      description: null,
      action: {
        text: 'Построить маршрут',
        onClick: handleBuildRoute,
      },
    },
    resolvedBranch && {
      key: 'phone',
      icon: <IconWrapper src={mobileIcon} size={32} iconSize={16} style={{ border: '1px solid var(--widget-border-secondary)' }} />,
      title: resolvedBranch.phone || 'Не указан',
      description: null,
      action: resolvedBranch.phone
        ? {
            text: 'Позвонить',
            onClick: handleCall,
          }
        : null,
    },
    resolvedBranch && {
      key: 'schedule',
      icon: <IconWrapper src={watchIcon} size={32} iconSize={16} style={{ border: '1px solid var(--widget-border-secondary)' }} />,
      title: resolvedBranch.schedule || 'Рабочие часы',
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
          className='appointment-confirmation-book-again-btn gw-primary-btn'
          block
          onClick={handleBookAgain}
          size='large'>
          Записаться ещё
        </Button>
      </div>
    </div>
  );
};
