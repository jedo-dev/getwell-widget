import { SearchOutlined } from '@ant-design/icons';
import { Input, List } from 'antd';
import React, { useMemo, useState } from 'react';

import {
  getWidgetState,
  goToDateTimeSelection,
  goToDoctorInfo,
  selectEmployee,
} from '../../../lib/widget-manager';
import { filterEmployeesByQuery } from '../../../shared/lib';
import { EmployeeListItem, EmptyState, StepFooter } from '../../../shared/ui';
import { Department, Employee } from '../../../types';
import './DepartmentSpecialistsSelection.css';

export interface DepartmentSpecialistsSelectionProps {
  employees: Employee[];
  selectedDepartment: Department | null;
  selectedEmployeeId: number | null;
}

export const DepartmentSpecialistsSelection: React.FC<DepartmentSpecialistsSelectionProps> = ({
  employees,
  selectedDepartment,
  selectedEmployeeId,
}) => {
  const widgetState = getWidgetState();
  const showDoctorInfo = widgetState.config?.showDoctorInfo ?? true;
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEmployees = useMemo(
    () => filterEmployeesByQuery(employees, searchQuery),
    [employees, searchQuery],
  );

  const selectedEmployee = selectedEmployeeId
    ? employees.find((emp) => emp.id === selectedEmployeeId) ?? null
    : null;

  const handleEmployeeSelect = (employeeId: number) => {
    selectEmployee(employeeId);
  };

  const handleSelectDateTime = () => {
    goToDateTimeSelection();
  };

  const handleDoctorInfo = () => {
    goToDoctorInfo();
  };

  // Temporary placeholders for “nearest appointment” and “time slots” chips
  const getNearestAppointment = (): string => 'сегодня';

  const getTimeSlots = (): string[] => [
    '12:00',
    '12:30',
    '13:00',
    '13:00',
    '13:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:30',
    '17:30',
  ];

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
              return (
                <List.Item>
                  <EmployeeListItem
                    prefix='department-specialists-selection'
                    employee={employee}
                    isSelected={isSelected}
                    showEmployeePosition={showEmployeePosition}
                    nearestAppointmentLabel={getNearestAppointment()}
                    timeSlots={isSelected ? getTimeSlots() : []}
                    onSelect={handleEmployeeSelect}
                    onClickTimeSlot={() => {
                      // Placeholder: later we will use API timechips here
                    }}
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <EmptyState description='Специалисты не найдены' />
        )}
      </div>

      {selectedEmployee && (
        <StepFooter
          secondary={
            showDoctorInfo
              ? {
                  label: 'О враче',
                  onClick: handleDoctorInfo,
                }
              : null
          }
          primary={{
            label: 'Выбрать дату и время',
            onClick: handleSelectDateTime,
          }}
        />
      )}
    </div>
  );
};
