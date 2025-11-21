import { RightOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, List, Radio, Segmented, Tabs, Tag } from 'antd';
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
import { formatEmployeeFullName } from '../../../shared/lib';
import { Avatar, EmptyState } from '../../../shared/ui';
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
  const [activeTab, setActiveTab] = useState<string>(
    selectionMode === SelectionMode.DEPARTMENT && showDepartments ? 'department' : 'name',
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    if (!searchQuery.trim()) {
      return departments;
    }

    const query = searchQuery.toLowerCase();
    return departments.filter((dept) => {
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

  // Временные данные для ближайшего времени приёма (заглушка)
  const getNearestAppointment = (employeeId: number): string => {
    // TODO: В будущем здесь будет запрос к API
    return 'сегодня';
  };

  // Временные данные для слотов времени (заглушка)
  const getTimeSlots = (employeeId: number): string[] => {
    // TODO: В будущем здесь будет запрос к API
    // Возвращаем примерные слоты как на макете
    return [
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
  };

  const options = [
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
          ) : <></>
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
                        const fullName = formatEmployeeFullName(employee);

                        const timeSlots = isSelected ? getTimeSlots(employee.id) : [];

                        return (
                          <List.Item
                            className={`specialist-selection-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleEmployeeSelect(employee.id)}>
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
                                    <div className='specialist-selection-item-specialization'>
                                      {employee.specialization}
                                    </div>
                                  </div>
                                </div>
                                <div className='specialist-selection-item-appointment'>
                                  Ближайшее время приёма:{' '}
                                  <Tag>{getNearestAppointment(employee.id)}</Tag>
                                </div>
                                {isSelected && timeSlots.length > 0 && (
                                  <div className='specialist-selection-time-slots'>
                                    {timeSlots.map((slot, index) => (
                                      <button
                                        key={`${slot}-${index}`}
                                        className='specialist-selection-time-slot'
                                        type='button'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // TODO: Обработка выбора слота времени
                                        }}>
                                        {slot}
                                      </button>
                                    ))}
                                  </div>
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
                  </div>
                ),
              },
            ]
            : []),
        ]}
      />

      {selectedEmployee && selectionMode === SelectionMode.EMPLOYEE && (
        <div className='specialist-selection-footer'>
          <Button className='specialist-selection-footer-btn secondary' onClick={handleDoctorInfo}>
            О враче
          </Button>
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
