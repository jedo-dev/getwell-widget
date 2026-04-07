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
import { ActionFooter, DoctorSelectionList, Notification } from '../../../shared/ui';
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

  const selectedEmployeeData = selectedEmployeeId
    ? doctorsWithSchedules.find((d) => d.employee.id === selectedEmployeeId)
    : undefined;
  const nearestTimeslot = findNearestTimeslot(selectedEmployeeData);
  const nearestAppointmentDate = formatNearestAppointmentDate(nearestTimeslot?.from || null);

  const isOnDepartmentSpecialistsStep =
    widgetState.currentStep === WidgetStep.DEPARTMENT_SPECIALISTS_SELECTION;
  const {
    timechips,
    loading: loadingTimechips,
    error: timechipsError,
  } = useTimechips(selectedEmployeeId, isOnDepartmentSpecialistsStep, nearestAppointmentDate.date);


  const handleTimeChipClick = async (timechip: AvailableTimechip) => {
    if (!selectedEmployeeId) return;

    if (timechip.department_id) {
      selectDepartmentOnly(timechip.department_id);
    }

    const fromIso = localDateTimeToIso(timechip.from);
    const toIso = localDateTimeToIso(timechip.to);
    selectDateTime(fromIso, toIso);


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

        if (result.unique_hash) {
          setReservedTimeslotHash(result.unique_hash);
        }
      } catch (error: any) {
        console.error('Error reserving slot:', error);
        if (error.code === 'DUPLICATE_ENTRY' || error.message === 'duplicate_entry') {
          setNotification({ message: 'Время уже занято. Пожалуйста, выберите другое время.' });
          return;
        }
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
        <ActionFooter
          className='specialist-selection-footer'
          showSecondary={showDoctorInfo}
          secondaryLabel='О враче'
          onSecondaryClick={handleDoctorInfo}
          primaryLabel={selectedTimechipKey ? 'Далее' : 'Выбрать дату и время'}
          onPrimaryClick={selectedTimechipKey ? handleContinueToPhoneInput : handleSelectDateTime}
        />
      )}
    </div>
  );
};
