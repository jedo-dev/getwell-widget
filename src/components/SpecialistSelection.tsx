import { RightOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Empty, Input, List, Radio, Segmented, Tabs, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  goToDateTimeSelection,
  goToDepartmentSelection,
  goToDoctorInfo,
  goToSpecialistSelection,
  selectDepartment,
  selectEmployee,
} from '../lib/widget-manager';
import { Department, Employee } from '../types';
import './SpecialistSelection.css';

export interface SpecialistSelectionProps {
  employees: Employee[];
  departments: Department[];
  selectedEmployeeId: number | null;
  selectedDepartmentId: number | null;
  selectionMode?: 'employee' | 'department';
}

const SpecialistSelection: React.FC<SpecialistSelectionProps> = ({
  employees,
  departments,
  selectedEmployeeId,
  selectedDepartmentId,
  selectionMode = 'employee',
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    selectionMode === 'department' ? 'department' : 'name',
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Обновляем активную вкладку при изменении режима выбора
  useEffect(() => {
    setActiveTab(selectionMode === 'department' ? 'department' : 'name');
  }, [selectionMode]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }

    const query = searchQuery.toLowerCase();
    return employees.filter((emp) => {
      const fullName = `${emp.lastName} ${emp.firstName} ${emp.patronymic || ''}`.toLowerCase();
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
    { label: 'По ФИО', value: 'name' },
    { label: 'По отделению', value: 'department' },
  ];

  return (
    <div className='specialist-selection'>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        renderTabBar={() => (
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
        )}
        defaultValue={selectionMode === 'department' ? 'department' : 'name'}
        className='specialist-selection-tabs'
        items={[
          {
            key: 'name',
            label: 'По ФИО',
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
                        const fullName = `${employee.lastName} ${employee.firstName} ${
                          employee.patronymic || ''
                        }`.trim();

                        const timeSlots = isSelected ? getTimeSlots(employee.id) : [];

                        return (
                          <List.Item
                            className={`specialist-selection-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleEmployeeSelect(employee.id)}>
                            <div className='specialist-selection-item-content'>
                              <div className='specialist-selection-item-content-left'>
                                <div className='specialist-selection-item-left'>
                                  <div className='specialist-selection-avatar'>
                                    {employee.photo ? (
                                      <img src={employee.photo} alt={fullName} />
                                    ) : (
                                      <UserOutlined />
                                    )}
                                  </div>
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
                    <Empty description='Специалисты не найдены' />
                  )}
                </div>
              </>
            ),
          },
          {
            key: 'department',
            label: 'По отделению',
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
                  <Empty description='Отделения не найдены' />
                )}
              </div>
            ),
          },
        ]}
      />

      {selectedEmployee && selectionMode === 'employee' && (
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

export default SpecialistSelection;
