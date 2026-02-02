import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, List, Radio, Skeleton, Tag } from 'antd';
import React, { useMemo, useState } from 'react';
import {
  getWidgetState,
  goToDateTimeSelection,
  goToDoctorInfo,
  goToPhoneInput,
  selectDateTime,
  selectEmployee,
} from '../../../lib/widget-manager';
import { AvailableDoctorsData } from '../../../shared/api/schedules';
import { WidgetStep } from '../../../shared/constants';
import { useTimechips } from '../../../shared/hooks/useTimechips';
import { findNearestTimeslot, formatEmployeeFullName, formatNearestAppointmentDate } from '../../../shared/lib';
import { Avatar, EmptyState } from '../../../shared/ui';
import { Department, Employee } from '../../../types';
import './DepartmentSpecialistsSelection.css';

export interface DepartmentSpecialistsSelectionProps {
  employees: Employee[];
  selectedDepartment: Department | null;
  selectedEmployeeId: number | null;
  doctorsWithSchedules?: AvailableDoctorsData[];
}

export const DepartmentSpecialistsSelection: React.FC<DepartmentSpecialistsSelectionProps> = ({
  employees,
  selectedDepartment,
  selectedEmployeeId,
  doctorsWithSchedules = [],
}) => {
  const widgetState = getWidgetState();
  const showDoctorInfo = widgetState.config?.showDoctorInfo ?? true;
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEmployees = useMemo(() => {
    let result = employees;

    // Фильтруем по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((emp) => {
        const fullName = formatEmployeeFullName(emp).toLowerCase();
        const specialization = emp.specialization.toLowerCase();
        return fullName.includes(query) || specialization.includes(query);
      });
    }

    return result;
  }, [employees, searchQuery]);

  const handleEmployeeSelect = (employeeId: number) => {
    selectEmployee(employeeId);
  };

  const handleSelectDateTime = () => {
    goToDateTimeSelection();
  };

  const handleDoctorInfo = () => {
    goToDoctorInfo();
  };

  const selectedEmployee = selectedEmployeeId
    ? employees.find((emp) => emp.id === selectedEmployeeId)
    : null;

  // Загружаем timechips для выбранного врача
  const isOnDepartmentSpecialistsStep =
    widgetState.currentStep === WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION;
  const { timechips, loading: loadingTimechips, error: timechipsError } = useTimechips(
    selectedEmployeeId,
    isOnDepartmentSpecialistsStep,
  );

  // Преобразуем "YYYY-MM-DD HH:mm:ss" в "HH:mm"
  const formatTimeFromDateTime = (dateTime: string): string => {
    const [datePart, timePart] = dateTime.split(' ');
    const [hh, mm] = timePart.split(':');
    return `${hh}:${mm}`;
  };

  // Преобразуем "YYYY-MM-DD HH:mm:ss" (локальное время) -> ISO строка
  const localDateTimeToIso = (dt: string): string => {
    const [datePart, timePart] = dt.split(' ');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm, ss] = timePart.split(':').map(Number);
    const local = new Date(y, m - 1, d, hh, mm, ss || 0, 0);
    return local.toISOString();
  };

  // Обработка клика на time-chip
  const handleTimeChipClick = (from: string, to: string) => {
    if (!selectedEmployeeId) return;

    // Сохраняем выбранного врача (уже выбран)
    // Сохраняем слот from/to
    const fromIso = localDateTimeToIso(from);
    const toIso = localDateTimeToIso(to);
    selectDateTime(fromIso, toIso);

    // Пропускаем календарь и переходим на phone-input
    goToPhoneInput();
  };

  // Показываем первые N слотов (8-12)
  const MAX_VISIBLE_SLOTS = 10;
  const visibleTimechips = timechips.slice(0, MAX_VISIBLE_SLOTS);
  const hasTimechips = visibleTimechips.length > 0;

  return (
    <div className='department-specialists-selection'>
      <div className='department-specialists-selection-content'>
        <Input
          placeholder='Поиск'
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='department-specialists-selection-search'
        />

        {filteredEmployees.length > 0 ? (
          <List
            className='department-specialists-selection-list'
            dataSource={filteredEmployees}
            renderItem={(employee) => {
              const isSelected = selectedEmployeeId === employee.id;
              const fullName = formatEmployeeFullName(employee);
              const isCurrentEmployee = isSelected && employee.id === selectedEmployeeId;

              return (
                <List.Item
                  className={`department-specialists-selection-item ${isSelected ? 'selected' : ''
                    }`}
                  onClick={() => handleEmployeeSelect(employee.id)}>
                  <div className='department-specialists-selection-item-content'>
                    <div className='department-specialists-selection-item-content-left'>
                      <div className='department-specialists-selection-item-left'>
                        <Avatar
                          src={employee.photo}
                          alt={fullName}
                          size='medium'
                          className='department-specialists-selection-avatar'
                        />
                        <div className='department-specialists-selection-item-info'>
                          <div className='department-specialists-selection-item-name'>
                            {fullName}
                          </div>
                          {showEmployeePosition && (
                            <div className='department-specialists-selection-item-specialization'>
                              {employee.specialization}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='department-specialists-selection-item-appointment'>
                        Ближайшее время приёма:{' '}
                        <Tag>
                          {(() => {
                            const doctorData = doctorsWithSchedules.find(
                              (d) => d.employee.id === employee.id,
                            );
                            const nearestTimeslot = findNearestTimeslot(doctorData);
                            return formatNearestAppointmentDate(nearestTimeslot?.from || null);
                          })()}
                        </Tag>
                      </div>
                      {isCurrentEmployee && (
                        <>

                          {loadingTimechips && (
                            <div className='department-specialists-selection-time-slots'>
                              <Skeleton.Button active size='small' block={false} />
                              <Skeleton.Button active size='small' block={false} />
                              <Skeleton.Button active size='small' block={false} />
                            </div>
                          )}
                          {!loadingTimechips && hasTimechips && (
                            <div className='department-specialists-selection-time-slots'>
                              {visibleTimechips.map((timechip, index) => {
                                const timeStr = formatTimeFromDateTime(timechip.from);
                                const isDisabled = timechip.is_limited;
                                return (
                                  <button
                                    key={`${timechip.from}-${index}`}
                                    className={`department-specialists-selection-time-slot ${isDisabled ? 'disabled' : ''
                                      }`}
                                    type='button'
                                    disabled={isDisabled}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isDisabled) {
                                        handleTimeChipClick(timechip.from, timechip.to);
                                      }
                                    }}>
                                    {timeStr}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          {!loadingTimechips && !hasTimechips && !timechipsError && (
                            <div className='department-specialists-selection-no-slots'>
                              <div className='department-specialists-selection-no-slots-text'>
                                Нет слотов на сегодня
                              </div>
                              <Button
                                type='link'
                                className='department-specialists-selection-select-date-btn'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectDateTime();
                                }}>
                                Выбрать дату и время
                              </Button>
                            </div>
                          )}
                          {!loadingTimechips && timechipsError && (
                            <div className='department-specialists-selection-no-slots'>
                              <Button
                                type='link'
                                className='department-specialists-selection-select-date-btn'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectDateTime();
                                }}>
                                Выбрать дату и время
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <Radio checked={isSelected} />
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <EmptyState description='Специалисты не найдены' />
        )}
      </div>

      {selectedEmployee && (
        <div className='specialist-selection-footer'>
          {showDoctorInfo && (
            <Button className='specialist-selection-footer-btn secondary' onClick={handleDoctorInfo}>
              О враче
            </Button>
          )}
          <Button
            type='primary'
            className='specialist-selection-footer-btn primary'
            onClick={handleSelectDateTime}>
            Выбрать дату и время
          </Button>
        </div>
      )}
    </div>
  );
};
