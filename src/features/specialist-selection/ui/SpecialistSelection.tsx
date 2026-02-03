import { RightOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, List, Segmented, Tabs } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import {
  getWidgetState,
  goToDateTimeSelection,
  goToDepartmentSelection,
  goToDoctorInfo,
  goToSpecialistSelection,
  selectDepartment,
  selectEmployee,
} from '../../../lib/widget-manager';
import { SELECTION_MODE_LABELS } from '../../../shared/constants';
import { filterDepartmentsByQuery, filterEmployeesByQuery } from '../../../shared/lib';
import { EmployeeListItem, EmptyState, StepFooter } from '../../../shared/ui';
import { Department, Employee, SelectionMode } from '../../../types';
import './SpecialistSelection.css';

export interface SpecialistSelectionProps {
  employees: Employee[];
  departments: Department[];
  selectedEmployeeId: number | null;
  selectedDepartmentId: number | null;
  selectionMode?: SelectionMode;
}

export const SpecialistSelection: React.FC<SpecialistSelectionProps> = ({
  employees,
  departments,
  selectedEmployeeId,
  selectedDepartmentId,
  selectionMode = SelectionMode.EMPLOYEE,
}) => {
  const widgetState = getWidgetState();
  const showDepartments = widgetState.config?.showDepartments ?? true;
  const showDoctorInfo = widgetState.config?.showDoctorInfo ?? true;
  const showEmployeePosition = widgetState.config?.showEmployeePosition ?? true;

  const [activeTab, setActiveTab] = useState<string>(
    selectionMode === SelectionMode.DEPARTMENT && showDepartments ? 'department' : 'name',
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync tab with selection mode
  useEffect(() => {
    if (selectionMode === SelectionMode.DEPARTMENT && showDepartments) {
      setActiveTab('department');
    } else {
      setActiveTab('name');
      // If departments are hidden but we are in department mode — switch to specialist mode
      if (selectionMode === SelectionMode.DEPARTMENT && !showDepartments) {
        goToSpecialistSelection();
      }
    }
  }, [selectionMode, showDepartments]);

  const filteredEmployees = useMemo(
    () => filterEmployeesByQuery(employees, searchQuery),
    [employees, searchQuery],
  );

  const filteredDepartments = useMemo(
    () => filterDepartmentsByQuery(departments, searchQuery),
    [departments, searchQuery],
  );

  const selectedEmployee = selectedEmployeeId
    ? employees.find((emp) => emp.id === selectedEmployeeId) ?? null
    : null;

  const handleEmployeeSelect = (employeeId: number) => {
    selectEmployee(employeeId);
  };

  const handleDepartmentSelect = (departmentId: number) => {
    selectDepartment(departmentId);
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

  const tabOptions = [
    { label: SELECTION_MODE_LABELS[SelectionMode.EMPLOYEE], value: 'name' },
    ...(showDepartments
      ? [{ label: SELECTION_MODE_LABELS[SelectionMode.DEPARTMENT], value: 'department' }]
      : []),
  ];

  return (
    <div className='specialist-selection'>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        renderTabBar={() =>
          tabOptions.length > 1 ? (
            <Segmented
              options={tabOptions}
              value={activeTab}
              className='branch-selection-tabs-segmented'
              onChange={(value) => {
                const nextKey = value as string;
                setActiveTab(nextKey);
                if (nextKey === 'department') {
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
        defaultValue={selectionMode === SelectionMode.DEPARTMENT && showDepartments ? 'department' : 'name'}
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
                        return (
                          <List.Item>
                            <EmployeeListItem
                              prefix='specialist-selection'
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
              </>
            ),
          },
          ...(showDepartments
            ? [
                {
                  key: 'department',
                  label: SELECTION_MODE_LABELS[SelectionMode.DEPARTMENT],
                  children: (
                    <div className='specialist-selection-content'>
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
                            const isSelected = selectedDepartmentId === department.id;

                            return (
                              <List.Item
                                className={`specialist-selection-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleDepartmentSelect(department.id)}
                              >
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
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />

      {selectedEmployee && selectionMode === SelectionMode.EMPLOYEE && (
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
