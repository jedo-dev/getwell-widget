import { Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  getWidgetState,
  goToDateTimeSelection,
  goToDoctorInfo,
  openGetWellWidget,
} from '../../../lib/widget-manager';
import { branchesApi } from '../../../shared/api';
import { petsApi } from '../../../shared/api/pets';
import { WidgetStep } from '../../../shared/constants';
import {
  formatDate,
  formatDateTime,
  formatEmployeeFullName,
  formatTime,
  formatUtcToTenantHHmm,
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

const DEFAULT_EVENT_DURATION_MINUTES = 30;
const OFFSET_RE = /([+-])\s*(\d{1,2})(?::?(\d{2}))?/;

type CalendarParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
};

const toUtcDate = (serverDateTime: string): Date | null => {
  if (!serverDateTime) {
    return null;
  }

  const normalized = serverDateTime.trim().replace(' ', 'T');
  const withZone =
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized) || /(?:Z|[+-]\d{4})$/i.test(normalized)
      ? normalized
      : `${normalized}Z`;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseUtcOffsetMinutes = (rawTimezone: string): number | null => {
  const match = rawTimezone.trim().toUpperCase().match(OFFSET_RE);
  if (!match) {
    return null;
  }
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return sign * (hours * 60 + minutes);
};

const toCalendarPartsFromUtc = (dateUtc: Date, timezone: Branch['timezone']): CalendarParts => {
  const candidates = [timezone?.name, timezone?.code]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: candidate,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const parts = formatter.formatToParts(dateUtc);
      const year = parts.find((part) => part.type === 'year')?.value;
      const month = parts.find((part) => part.type === 'month')?.value;
      const day = parts.find((part) => part.type === 'day')?.value;
      const hour = parts.find((part) => part.type === 'hour')?.value;
      const minute = parts.find((part) => part.type === 'minute')?.value;
      if (year && month && day && hour && minute) {
        return { year, month, day, hour, minute };
      }
    } catch {
      // Try offset-based parsing below.
    }

    const offsetMinutes = parseUtcOffsetMinutes(candidate);
    if (offsetMinutes !== null) {
      const shifted = new Date(dateUtc.getTime() + offsetMinutes * 60_000);
      return {
        year: String(shifted.getUTCFullYear()),
        month: String(shifted.getUTCMonth() + 1).padStart(2, '0'),
        day: String(shifted.getUTCDate()).padStart(2, '0'),
        hour: String(shifted.getUTCHours()).padStart(2, '0'),
        minute: String(shifted.getUTCMinutes()).padStart(2, '0'),
      };
    }
  }

  return {
    year: String(dateUtc.getUTCFullYear()),
    month: String(dateUtc.getUTCMonth() + 1).padStart(2, '0'),
    day: String(dateUtc.getUTCDate()).padStart(2, '0'),
    hour: String(dateUtc.getUTCHours()).padStart(2, '0'),
    minute: String(dateUtc.getUTCMinutes()).padStart(2, '0'),
  };
};

const toIcsFloatingDateTime = (parts: CalendarParts): string =>
  `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}00`;

const isValidDate = (value: Date | null): value is Date =>
  value !== null && !Number.isNaN(value.getTime());
const toIcsDateTime = (date: Date): string =>
  date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const escapeIcsText = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

export const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  selectedBranch,
  selectedEmployee,
  selectedDateTime,
  phone,
  selectedPetId,
  hasHeaderImage = false,
}) => {
  const widgetState = getWidgetState();
  const appointmentSubmissionError = widgetState.appointmentSubmissionError;
  const isFailureState = Boolean(appointmentSubmissionError);
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

  const handleAddToCalendar = async () => {
    const startSource = widgetState.selectedTimeSlotRaw || selectedDateTime;
    const startUtc = startSource ? toUtcDate(startSource) : null;
    if (!startUtc) {
      return;
    }

    const endSource = widgetState.selectedTimeSlotToRaw || widgetState.selectedTimeSlotTo || null;
    const endUtcCandidate = endSource
      ? toUtcDate(endSource)
      : new Date(startUtc.getTime() + DEFAULT_EVENT_DURATION_MINUTES * 60 * 1000);
    const endUtc =
      endUtcCandidate || new Date(startUtc.getTime() + DEFAULT_EVENT_DURATION_MINUTES * 60 * 1000);

    const doctorName = fullName || 'Специалист';
    const branchName = resolvedBranch?.name?.trim();
    const branchAddress = resolvedBranch?.address?.trim();
    const title = branchName
      ? `Запись к ${doctorName} (${branchName})`
      : `Запись к ${doctorName}`;
    const descriptionLines = [
      branchAddress ? `Адрес: ${branchAddress}` : null,
      resolvedBranch?.phone ? `Телефон: ${resolvedBranch.phone}` : null,
      dateTimeInfo ? `Дата: ${dateTimeInfo.date}, ${dateTimeInfo.time}` : null,
    ].filter(Boolean) as string[];
    const description = descriptionLines.join('\n');

    const startParts = toCalendarPartsFromUtc(startUtc, selectedBranchTimezone);
    const endParts = toCalendarPartsFromUtc(endUtc, selectedBranchTimezone);
    const dtStart = toIcsFloatingDateTime(startParts);
    const dtEnd = toIcsFloatingDateTime(endParts);
    const dtStamp = toIcsDateTime(new Date());
    const uid = `getwell-${startUtc.getTime()}-${Math.random().toString(36).slice(2, 10)}@widget`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GetWell//Appointment Widget//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeIcsText(title)}`,
      description ? `DESCRIPTION:${escapeIcsText(description)}` : null,
      branchAddress ? `LOCATION:${escapeIcsText(branchAddress)}` : null,
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ]
      .filter(Boolean)
      .join('\r\n');

    const fileName = `getwell-appointment-${dtStart}.ics`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });

    const file = new File([blob], fileName, {
      type: 'text/calendar;charset=utf-8',
    });
    const nav = navigator as Navigator & {
      canShare?: (data: { files?: File[] }) => boolean;
      share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
    };

    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({
          files: [file],
          title,
          text: description,
        });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') {
          return;
        }
        console.warn('Web Share API failed, falling back to download', error);
      }
    }

    try {
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error('Failed to download calendar file, trying data URI fallback', error);
      window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    }
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

  const handleChooseAnotherTime = () => {
    goToDateTimeSelection();
  };

  const handleDoctorInfo = () => {
    goToDoctorInfo(WidgetStep.APPOINTMENT_CONFIRMATION);
  };

  const dateTime = selectedDateTime ? new Date(selectedDateTime) : null;
  const selectedBranchTimezone =
    resolvedBranch?.timezone ??
    widgetState.config?.branches?.find((branch) => branch.id === widgetState.selectedBranchId)
      ?.timezone ??
    null;
  const selectedTimeSlotRaw = widgetState.selectedTimeSlotRaw;
  const formattedDate = dateTime ? formatDate(dateTime) : '';
  const formattedTime = selectedTimeSlotRaw
    ? formatUtcToTenantHHmm(selectedTimeSlotRaw, selectedBranchTimezone)
    : dateTime
      ? formatTime(dateTime)
      : '';
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
          size={24}
          iconSize={24}
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
          size={24}
          iconSize={24}
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
          size={24}
          iconSize={24}
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
          size={24}
          iconSize={24}
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
            size={24}
            iconSize={24}
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
          size={24}
          iconSize={24}
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
      {isFailureState ? (
        <>
          <div
            className={`appointment-confirmation-info-container appointment-confirmation-info-container--failure${
              hasHeaderImage ? ' appointment-confirmation-info-container--with-image' : ''
            }`}>
            <h2 className='appointment-confirmation-title appointment-confirmation-title--failure'>
              Не удалось записаться на приём
            </h2>
            <div className='appointment-confirmation-time-container appointment-confirmation-time-container--failure'>
              {appointmentSubmissionError?.message ||
                'Время бронирования слота истекло. Пожалуйста, выберите другое время'}
            </div>
          </div>

          <div className='gw-action-footer specialist-selection-footer appointment-confirmation-footer'>
            <Button
              type='primary'
              className='gw-action-footer-btn gw-action-footer-btn--primary appointment-confirmation-book-again-btn gw-primary-btn'
              onClick={handleChooseAnotherTime}
              size='large'>
              Выбрать другое время
            </Button>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};
