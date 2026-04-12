import { Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { getWidgetState, goToDoctorInfo, openGetWellWidget } from '../../../lib/widget-manager';
import { branchesApi } from '../../../shared/api';
import { petsApi } from '../../../shared/api/pets';
import { WidgetStep } from '../../../shared/constants';
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
import pawIcon from '../../../img/confirmation-icon/pet.svg';
import watchIcon from '../../../img/confirmation-icon/watch.svg';
export interface AppointmentConfirmationProps {
  selectedBranch: Branch | null;
  selectedEmployee: Employee | null;
  selectedDateTime: string | null;
  phone: string | null;
  selectedPetId: number | null;
  hasHeaderImage?: boolean;
}

export const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  selectedBranch,
  selectedEmployee,
  selectedDateTime,
  phone,
  selectedPetId,
  hasHeaderImage = false,
}) => {
  const widgetState = getWidgetState();
  const showDoctorInfo = widgetState.config?.showDoctorInfo ?? true;
  const appointmentDraft = widgetState.appointmentDetailsDraft;
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [resolvedBranch, setResolvedBranch] = useState<Branch | null>(selectedBranch);
  const [loadingPet, setLoadingPet] = useState<boolean>(false);

  useEffect(() => {
    setResolvedBranch(selectedBranch);

    const loadBranchDetails = async () => {
      const branchId = selectedBranch?.id ?? widgetState.selectedBranchId ?? null;
      if (!branchId) {
        return;
      }

      if (selectedBranch?.phone && selectedBranch.schedule) {
        return;
      }

      try {
        const branchDetails = await branchesApi.getById(branchId);
        if (branchDetails) {
          setResolvedBranch((prev) => ({ ...(prev || {}), ...branchDetails }));
        }
      } catch (error) {
        console.error('Ошибка загрузки филиала для подтверждения:', error);
      }
    };

    loadBranchDetails();
  }, [selectedBranch, widgetState.selectedBranchId]);

  useEffect(() => {
    const loadPet = async () => {
      if (!selectedPetId) {
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
  }, [selectedPetId]);

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

  const handleDoctorInfo = () => {
    goToDoctorInfo(WidgetStep.APPOINTMENT_CONFIRMATION);
  };

  const dateTime = selectedDateTime ? new Date(selectedDateTime) : null;
  const formattedDate = dateTime ? formatDate(dateTime) : '';
  const formattedTime = dateTime ? formatTime(dateTime) : '';
  const normalizeSchedule = (schedule?: string): string => {
    if (!schedule) return 'Рабочие часы';

    const parts = schedule
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length < 2) {
      return schedule;
    }

    const timePattern = /(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/;
    const ranges = parts
      .map((part) => {
        const match = part.match(timePattern);
        if (!match) return null;
        return `${match[1]}-${match[2]}`;
      })
      .filter(Boolean) as string[];

    if (ranges.length !== parts.length) {
      return schedule;
    }

    const firstRange = ranges[0];
    const isSameEveryDay = ranges.every((range) => range === firstRange);
    if (!isSameEveryDay) {
      return schedule;
    }

    const [from, to] = firstRange.split('-');
    return `ежедневно ${from} - ${to}`;
  };

  const appointmentItems: Array<{
    key: string;
    icon: React.ReactNode;
    title: string;
    description: string | null;
    action: { text: string; onClick: () => void } | null;
  }> = [];

  const fallbackPetName = appointmentDraft?.petName?.trim() || '';
  const fallbackPetSpecies = String(appointmentDraft?.petSpecies || '').trim();
  const fallbackPetBreed = appointmentDraft?.petBreed?.trim() || '';
  const displayPetName = selectedPet?.name || fallbackPetName;
  const displayPetDescription = [
    selectedPet?.species || fallbackPetSpecies,
    selectedPet?.breed || fallbackPetBreed,
  ]
    .map((value) => (value ? String(value).trim() : ''))
    .filter(Boolean)
    .join(' • ');

  if (displayPetName) {
    appointmentItems.push({
      key: 'pet',
      icon: (
        <IconWrapper
          src={pawIcon}
          size={32}
          iconSize={16}
          withBackground={false}
          color='var(--widget-text-secondary)'
        />
      ),
      title: displayPetName,
      description: displayPetDescription || null,
      action: null,
    });
  }

  if (selectedEmployee) {
    appointmentItems.push({
      key: 'employee',
      icon: (
        <IconWrapper
          src={UserIcon}
          size={32}
          iconSize={16}
          withBackground={false}
          color='var(--widget-text-secondary)'
        />
      ),
      title: fullName,
      description: null,
      action: showDoctorInfo
        ? {
            text: 'Подробнее',
            onClick: handleDoctorInfo,
          }
        : null,
    });
  }

  if (dateTimeInfo) {
    appointmentItems.push({
      key: 'datetime',
      icon: (
        <IconWrapper
          src={CalendarIcon}
          size={32}
          iconSize={16}
          withBackground={false}
          color='var(--widget-text-secondary)'
        />
      ),
      title: `${formattedDate}${formattedTime ? `, ${formattedTime}` : ''}`,
      description: null,
      action: {
        text: 'Добавить в календарь',
        onClick: handleAddToCalendar,
      },
    });
  }

  if (resolvedBranch) {
    appointmentItems.push({
      key: 'address',
      icon: (
        <IconWrapper
          src={LocationIcon}
          size={32}
          iconSize={16}
          withBackground={false}
          color='var(--widget-text-secondary)'
        />
      ),
      title: resolvedBranch.address,
      description: null,
      action: {
        text: 'Построить маршрут',
        onClick: handleBuildRoute,
      },
    });

    const branchPhone = (resolvedBranch.phone || '').trim();
    if (branchPhone) {
      appointmentItems.push({
        key: 'phone',
        icon: (
          <IconWrapper
            src={mobileIcon}
            size={32}
            iconSize={16}
            withBackground={false}
            color='var(--widget-text-secondary)'
          />
        ),
        title: branchPhone,
        description: null,
        action: {
          text: 'Позвонить',
          onClick: handleCall,
        },
      });
    }

    appointmentItems.push({
      key: 'schedule',
      icon: (
        <IconWrapper
          src={watchIcon}
          size={32}
          iconSize={16}
          withBackground={false}
          color='var(--widget-text-secondary)'
        />
      ),
      title: normalizeSchedule(resolvedBranch.schedule),
      description: null,
      action: null,
    });
  }

  return (
    <div className='appointment-confirmation'>
      {/* Main Image Container */}

      {/* Appointment Info Container */}
      <div
        className={`appointment-confirmation-info-container${
          hasHeaderImage ? ' appointment-confirmation-info-container--with-image' : ''
        }`}>
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
                    <div
                      className={`appointment-confirmation-detail-title${
                        item.key === 'address'
                          ? ' appointment-confirmation-detail-title--address'
                          : ''
                      }`}
                      title={item.key === 'address' ? item.title : undefined}>
                      {item.title}
                    </div>
                  </div>
                  {!item.action && item.description ? (
                    <span className='appointment-confirmation-detail-description'>
                      {item.description}
                    </span>
                  ) : null}
                  {item.action && (
                    <button
                      type='button'
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
      <div className='gw-action-footer specialist-selection-footer appointment-confirmation-footer'>
        <Button
          type='primary'
          className='gw-action-footer-btn gw-action-footer-btn--primary appointment-confirmation-book-again-btn gw-primary-btn'
          onClick={handleBookAgain}
          size='large'>
          Записаться ещё
        </Button>
      </div>
    </div>
  );
};
