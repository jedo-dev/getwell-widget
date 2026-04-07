import { Button } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  getWidgetState,
  goToDateTimeSelection,
  goToDoctorInfo,
  goToPhoneInput,
  selectDateTime,
  selectDepartmentOnly,
  selectEmployee,
  setReservedTimeslotHash,
} from '../../../lib/widget-manager';
import {
  AvailableDoctorsData,
  AvailableTimechip,
  schedulesApi,
} from '../../../shared/api/schedules';
import { WidgetStep } from '../../../shared/constants';
import { useTimechips } from '../../../shared/hooks/useTimechips';
import {
  findNearestTimeslot,
  formatEmployeeFullName,
  formatNearestAppointmentDate,
  localDateTimeToIso,
} from '../../../shared/lib';
import { DoctorSelectionList, Notification } from '../../../shared/ui';
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
  const [notification, setNotification] = useState<{ message: string } | null>(null);
  const [selectedTimechipKey, setSelectedTimechipKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTimechipKey(null);
  }, [selectedEmployeeId]);

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

  const handleContinueToPhoneInput = () => {
    goToPhoneInput();
  };

  const handleDoctorInfo = () => {
    goToDoctorInfo();
  };

  const selectedEmployee = selectedEmployeeId
    ? employees.find((emp) => emp.id === selectedEmployeeId)
    : null;

  // Находим ближайший timeslot для выбранного врача
  const selectedEmployeeData = selectedEmployeeId
    ? doctorsWithSchedules.find((d) => d.employee.id === selectedEmployeeId)
    : undefined;
  const nearestTimeslot = findNearestTimeslot(selectedEmployeeData);
  const nearestAppointmentDate = formatNearestAppointmentDate(nearestTimeslot?.from || null);

  // Загружаем timechips для выбранного врача
  const isOnDepartmentSpecialistsStep =
    widgetState.currentStep === WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION;
  const {
    timechips,
    loading: loadingTimechips,
    error: timechipsError,
  } = useTimechips(selectedEmployeeId, isOnDepartmentSpecialistsStep, nearestAppointmentDate.date);


  // Обработка клика на time-chip
  const handleTimeChipClick = async (timechip: AvailableTimechip) => {
    if (!selectedEmployeeId) return;

    // Сохраняем department_id из timechip, если он есть
    if (timechip.department_id) {
      selectDepartmentOnly(timechip.department_id);
    }

    // Сохраняем выбранного врача (уже выбран)
    // Сохраняем слот from/to
    const fromIso = localDateTimeToIso(timechip.from);
    const toIso = localDateTimeToIso(timechip.to);
    selectDateTime(fromIso, toIso);

    // Резервируем слот на 5 минут

    if (widgetState.config?.apiUrl && selectedDepartment?.id) {
      try {
        const result = await schedulesApi.reserveTimeslot({
          apiUrl: widgetState.config.apiUrl,
          timeslot: {
            from: timechip.from,
            to: timechip.to,
          },
          departmentId: selectedDepartment.id,
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

    setSelectedTimechipKey(`${timechip.from}_${timechip.to}`);
  };
  return (
    <div className='department-specialists-selection'>
      {notification && (
        <Notification
          message={notification.message}
          type='error'
          duration={5000}
          onClose={() => setNotification(null)}
        />
      )}
      <div className='department-specialists-selection-content'>
        <DoctorSelectionList
          baseClass='department-specialists-selection'
          employees={filteredEmployees}
          doctorsWithSchedules={doctorsWithSchedules}
          selectedEmployeeId={selectedEmployeeId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEmployeeSelect={handleEmployeeSelect}
          showEmployeePosition={showEmployeePosition}
          loadingTimechips={loadingTimechips}
          timechips={timechips}
          timechipsError={timechipsError}
          selectedTimechipKey={selectedTimechipKey}
          onTimechipClick={handleTimeChipClick}
          onSelectDateTime={handleSelectDateTime}
        />
      </div>
      {selectedEmployee && (
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
            onClick={selectedTimechipKey ? handleContinueToPhoneInput : handleSelectDateTime}>
            {selectedTimechipKey ? 'Далее' : 'Выбрать дату и время'}
          </Button>
        </div>
      )}
    </div>
  );
};

