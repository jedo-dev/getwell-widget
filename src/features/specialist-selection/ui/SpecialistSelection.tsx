import { RightOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, List, Radio, Segmented, Skeleton, Tabs, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  getWidgetState,
  goToDateTimeSelection,
  goToDepartmentSelection,
  goToDoctorInfo,
  goToPhoneInput,
  goToSpecialistSelection,
  selectDateTime,
  selectDepartment,
  selectEmployee,
  setReservedTimeslotHash,
} from '../../../lib/widget-manager';
import {
  AvailableDoctorsData,
  AvailableTimechip,
  schedulesApi,
} from '../../../shared/api/schedules';
import { SELECTION_MODE_LABELS, WidgetStep } from '../../../shared/constants';
import { useTimechips } from '../../../shared/hooks/useTimechips';
import {
  findNearestTimeslot,
  formatEmployeeFullName,
  formatNearestAppointmentDate,
} from '../../../shared/lib';
import { Avatar, EmptyState, Notification } from '../../../shared/ui';
import { Department, Employee, SelectionMode } from '../../../types';
import './SpecialistSelection.css';

export interface SpecialistSelectionProps {
  employees: Employee[];
  departments: Department[];
  selectedEmployeeId: number | null;
  selectedDepartmentId: number | null;
  selectionMode?: SelectionMode;
  doctorsWithSchedules?: AvailableDoctorsData[];
}

export const SpecialistSelection: React.FC<SpecialistSelectionProps> = ({
  employees,
  departments,
  selectedEmployeeId,
  selectedDepartmentId,
  selectionMode = SelectionMode.EMPLOYEE,
  doctorsWithSchedules = [],
}) => {
  const widgetState = getWidgetState();
  const showDepartments = widgetState.config?.showDepartments ?? true;
  const showDoctorInfo = widgetState.config?.showDoctorInfo ?? true;
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;
  const selectedFilial = widgetState.selectedBranchId;
  const [activeTab, setActiveTab] = useState<string>(
    selectionMode === SelectionMode.DEPARTMENT && showDepartments ? 'department' : 'name',
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string } | null>(null);

  // Обновляем активную вкладку при изменении режима выбора
  useEffect(() => {
    if (selectionMode === SelectionMode.DEPARTMENT && showDepartments) {
      setActiveTab('department');
    } else {
      setActiveTab('name');
      // Если отделения скрыты, но мы в режиме выбора отделения, переключаемся на специалиста
      if (selectionMode === SelectionMode.DEPARTMENT && !showDepartments) {
        goToSpecialistSelection();
      }
    }
  }, [selectionMode, showDepartments]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }

    const query = searchQuery.toLowerCase();
    return employees.filter((emp) => {
      const fullName = formatEmployeeFullName(emp).toLowerCase();
      const specialization = emp.specialization.toLowerCase();
      return fullName.includes(query) || specialization.includes(query);
    });
  }, [employees, searchQuery]);

  const filteredDepartments = useMemo(() => {
    let deps = departments;
    if (selectedFilial) {
      deps = departments.filter((department) => department.filialId === selectedFilial);
    }
    if (!searchQuery.trim()) {
      return deps;
    }

    const query = searchQuery.toLowerCase();
    return deps.filter((dept) => {
      return dept.name.toLowerCase().includes(query);
    });
  }, [departments, searchQuery]);

  const handleEmployeeSelect = (employeeId: number) => {
    selectEmployee(employeeId);
  };

  const handleDepartmentSelect = (departmentId: number) => {
    selectDepartment(departmentId);
    // После выбора отделения переходим к списку врачей отделения
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

  const selectedDepartment = selectedDepartmentId
    ? departments.find((dept) => dept.id === selectedDepartmentId)
    : null;

  // Находим ближайший timeslot для выбранного врача
  const selectedEmployeeData = selectedEmployeeId
    ? doctorsWithSchedules.find((d) => d.employee.id === selectedEmployeeId)
    : undefined;
  const nearestTimeslot = findNearestTimeslot(selectedEmployeeData);
  const nearestAppointmentDate = formatNearestAppointmentDate(nearestTimeslot?.from || null);

  // Загружаем timechips для выбранного врача
  const isOnSpecialistSelectionStep = widgetState.currentStep === WidgetStep.SPECIALIST_SELECTION;
  const {
    timechips,
    loading: loadingTimechips,
    error: timechipsError,
  } = useTimechips(
    selectedEmployeeId,
    isOnSpecialistSelectionStep && selectionMode === SelectionMode.EMPLOYEE,
    nearestAppointmentDate.date,
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
  const handleTimeChipClick = async (timechip: AvailableTimechip) => {
    if (!selectedEmployeeId) return;

    // Сохраняем department_id из timechip, если он есть
    if (timechip.department_id) {
      selectDepartment(timechip.department_id);
    }

    // Сохраняем выбранного врача (уже выбран)
    // Сохраняем слот from/to
    const fromIso = localDateTimeToIso(timechip.from);
    const toIso = localDateTimeToIso(timechip.to);
    selectDateTime(fromIso, toIso);

    // Резервируем слот на 5 минут
    if (widgetState.config?.apiUrl && widgetState.selectedDepartmentId) {
      try {
        const result = await schedulesApi.reserveTimeslot({
          apiUrl: widgetState.config.apiUrl,
          timeslot: {
            from: timechip.from,
            to: timechip.to,
          },
          departmentId: widgetState.selectedDepartmentId,
          employeeId: selectedEmployeeId,
          uniqueHash: widgetState.reservedTimeslotHash || undefined,
        });

        // Сохраняем unique_hash
        if (result.unique_hash) {
          setReservedTimeslotHash(result.unique_hash);
        }
      } catch (error: any) {
        console.error('Ошибка резервирования слота:', error);
        if (error.code === 'DUPLICATE_ENTRY' || error.message === 'duplicate_entry') {
          setNotification({ message: 'Время уже занято. Пожалуйста, выберите другое время.' });
          return;
        }
        // Продолжаем выполнение даже при другой ошибке резервирования
        return;
      }
    }

    // Пропускаем календарь и переходим на phone-input
    goToPhoneInput();
  };

  // Показываем первые N слотов (8-12)
  const MAX_VISIBLE_SLOTS = 10;
  const visibleTimechips = timechips.slice(0, MAX_VISIBLE_SLOTS);
  const hasTimechips = visibleTimechips.length > 0;

  const options = [
    { label: SELECTION_MODE_LABELS[SelectionMode.EMPLOYEE], value: 'name' },
    ...(showDepartments
      ? [{ label: SELECTION_MODE_LABELS[SelectionMode.DEPARTMENT], value: 'department' }]
      : []),
  ];

  return (
    <div className='specialist-selection'>
      {notification && (
        <Notification
          message={notification.message}
          type='error'
          duration={5000}
          onClose={() => setNotification(null)}
        />
      )}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        renderTabBar={() =>
          options.length > 1 ? (
            <Segmented
              options={options}
              value={activeTab}
              className='branch-selection-tabs-segmented'
              onChange={(value) => {
                setActiveTab(value as string);
                if (value === 'department') {
                  goToDepartmentSelection();
                } else {
                  goToSpecialistSelection();
                }
              }}
            />
          ) : (
            <></>
          )
        }
        defaultValue={
          selectionMode === SelectionMode.DEPARTMENT && showDepartments ? 'department' : 'name'
        }
        className='specialist-selection-tabs'
        items={[
          {
            key: 'name',
            label: SELECTION_MODE_LABELS[SelectionMode.EMPLOYEE],
            children: (
              <>
                <Input
                  placeholder='Поиск'
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='specialist-selection-search'
                />
                <div className='specialist-selection-content'>
                  {filteredEmployees.length > 0 ? (
                    <List
                      className='specialist-selection-list'
                      dataSource={filteredEmployees}
                      renderItem={(employee) => {
                        const isSelected = selectedEmployeeId === employee.id;
                        const fullName = formatEmployeeFullName(employee);
                        const isCurrentEmployee = isSelected && employee.id === selectedEmployeeId;
                        const doctorData = doctorsWithSchedules.find(
                          (d) => d.employee.id === employee.id,
                        );
                        const nearestTimeslot = findNearestTimeslot(doctorData);
                        const appointmentDate = formatNearestAppointmentDate(
                          nearestTimeslot?.from || null,
                        );
                        const hasAppointment = !!appointmentDate.date;

                        return (
                          <List.Item
                            className={`specialist-selection-item ${isSelected ? 'selected' : ''} ${
                              !hasAppointment ? 'disabled' : ''
                            }`}
                            onClick={() => {
                              // Отключаем клик, если нет ближайшей записи
                              if (hasAppointment) {
                                handleEmployeeSelect(employee.id);
                              }
                            }}>
                            <div className='specialist-selection-item-content'>
                              <div className='specialist-selection-item-content-left'>
                                <div className='specialist-selection-item-left'>
                                  <Avatar
                                    src={employee.photo}
                                    alt={fullName}
                                    size='medium'
                                    className='specialist-selection-avatar'
                                  />
                                  <div className='specialist-selection-item-info'>
                                    <div className='specialist-selection-item-name'>{fullName}</div>
                                    {showEmployeePosition && (
                                      <div className='specialist-selection-item-specialization'>
                                        {employee.specialization}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className='specialist-selection-item-appointment'>
                                  Ближайшее время приёма: <Tag>{appointmentDate.text}</Tag>
                                </div>
                                {isCurrentEmployee && (
                                  <>
                                    {loadingTimechips && (
                                      <div className='specialist-selection-time-slots'>
                                        <Skeleton.Button active size='small' block={false} />
                                        <Skeleton.Button active size='small' block={false} />
                                        <Skeleton.Button active size='small' block={false} />
                                      </div>
                                    )}
                                    {!loadingTimechips && hasTimechips && (
                                      <div className='specialist-selection-time-slots'>
                                        {visibleTimechips.map((timechip, index) => {
                                          const timeStr = formatTimeFromDateTime(timechip.from);
                                          const isDisabled = timechip.is_limited;
                                          return (
                                            <button
                                              key={`${timechip.from}-${index}`}
                                              className={`specialist-selection-time-slot ${
                                                isDisabled ? 'disabled' : ''
                                              }`}
                                              type='button'
                                              disabled={isDisabled}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isDisabled) {
                                                  handleTimeChipClick(timechip);
                                                }
                                              }}>
                                              {timeStr}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {!loadingTimechips && !hasTimechips && !timechipsError && (
                                      <div className='specialist-selection-no-slots'>
                                        <div className='specialist-selection-no-slots-text'>
                                          Нет слотов на сегодня
                                        </div>
                                        <Button
                                          type='link'
                                          className='specialist-selection-select-date-btn'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectDateTime();
                                          }}>
                                          Выбрать дату и время
                                        </Button>
                                      </div>
                                    )}
                                    {!loadingTimechips && timechipsError && (
                                      <div className='specialist-selection-no-slots'>
                                        <Button
                                          type='link'
                                          className='specialist-selection-select-date-btn'
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
              </>
            ),
          },
          ...(showDepartments
            ? [
                {
                  key: 'department',
                  label: SELECTION_MODE_LABELS[SelectionMode.DEPARTMENT],
                  children: (
                    <>
                      <Input
                        placeholder='Поиск'
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='specialist-selection-search'
                      />

                      {filteredDepartments.length > 0 ? (
                        <List
                          className='specialist-selection-list'
                          dataSource={filteredDepartments}
                          renderItem={(department) => {
                            console.log(department);
                            const isSelected = selectedDepartmentId === department.id;

                            return (
                              <List.Item
                                className={`specialist-selection-item ${
                                  isSelected ? 'selected' : ''
                                }`}
                                onClick={() => handleDepartmentSelect(department.id)}>
                                <div className='specialist-selection-item-content'>
                                  <div className='specialist-selection-item-left'>
                                    <div className='specialist-selection-item-info'>
                                      <div className='specialist-selection-item-name'>
                                        {department.name}
                                      </div>
                                    </div>
                                  </div>
                                  <RightOutlined className='specialist-selection-item-arrow' />
                                </div>
                              </List.Item>
                            );
                          }}
                        />
                      ) : (
                        <EmptyState description='Отделения не найдены' />
                      )}
                    </>
                  ),
                },
              ]
            : []),
        ]}
      />

      {selectedEmployee && selectionMode === SelectionMode.EMPLOYEE && (
        <div className='specialist-selection-footer'>
          {showDoctorInfo && (
            <Button
              className='specialist-selection-footer-btn secondary'
              onClick={handleDoctorInfo}>
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
