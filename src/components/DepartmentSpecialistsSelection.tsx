import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Empty, Input, List, Radio, Tag } from 'antd';
import React, { useMemo, useState } from 'react';
import {
  goBack,
  goToDateTimeSelection,
  goToDoctorInfo,
  selectEmployee,
} from '../lib/widget-manager';
import { Department, Employee } from '../types';
import './DepartmentSpecialistsSelection.css';

export interface DepartmentSpecialistsSelectionProps {
  employees: Employee[];
  selectedDepartment: Department | null;
  selectedEmployeeId: number | null;
}

const DepartmentSpecialistsSelection: React.FC<DepartmentSpecialistsSelectionProps> = ({
  employees,
  selectedDepartment,
  selectedEmployeeId,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEmployees = useMemo(() => {
    let result = employees;

    // Фильтруем по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((emp) => {
        const fullName = `${emp.lastName} ${emp.firstName} ${emp.patronymic || ''}`.toLowerCase();
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

  const handleBack = () => {
    goBack();
  };

  const selectedEmployee = selectedEmployeeId
    ? employees.find((emp) => emp.id === selectedEmployeeId)
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
              const fullName = `${employee.lastName} ${employee.firstName} ${
                employee.patronymic || ''
              }`.trim();

              const timeSlots = isSelected ? getTimeSlots(employee.id) : [];

              return (
                <List.Item
                  className={`department-specialists-selection-item ${
                    isSelected ? 'selected' : ''
                  }`}
                  onClick={() => handleEmployeeSelect(employee.id)}>
                  <div className='department-specialists-selection-item-content'>
                    <div className='department-specialists-selection-item-content-left'>
                      <div className='department-specialists-selection-item-left'>
                        <div className='department-specialists-selection-avatar'>
                          {employee.photo ? (
                            <img src={employee.photo} alt={fullName} />
                          ) : (
                            <UserOutlined />
                          )}
                        </div>
                        <div className='department-specialists-selection-item-info'>
                          <div className='department-specialists-selection-item-name'>
                            {fullName}
                          </div>
                          <div className='department-specialists-selection-item-specialization'>
                            {employee.specialization}
                          </div>
                        </div>
                      </div>
                      <div className='department-specialists-selection-item-appointment'>
                        Ближайшее время приёма: <Tag>{getNearestAppointment(employee.id)}</Tag>
                      </div>
                      {isSelected && timeSlots.length > 0 && (
                        <div className='department-specialists-selection-time-slots'>
                          {timeSlots.map((slot, index) => (
                            <button
                              key={`${slot}-${index}`}
                              className='department-specialists-selection-time-slot'
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

      {selectedEmployee && (
        <div className='department-specialists-selection-footer'>
          <Button
            className='department-specialists-selection-footer-btn secondary'
            onClick={handleDoctorInfo}>
            О враче
          </Button>
          <Button
            type='primary'
            className='department-specialists-selection-footer-btn primary'
            onClick={handleSelectDateTime}>
            Выбрать дату и время
          </Button>
        </div>
      )}
    </div>
  );
};

export default DepartmentSpecialistsSelection;
