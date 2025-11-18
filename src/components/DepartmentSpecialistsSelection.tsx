import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Empty, Input, List, Radio } from 'antd';
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

              return (
                <List.Item
                  className={`department-specialists-selection-item ${
                    isSelected ? 'selected' : ''
                  }`}
                  onClick={() => handleEmployeeSelect(employee.id)}>
                  <div className='department-specialists-selection-item-content'>
                    <div className='department-specialists-selection-item-left'>
                      <div className='department-specialists-selection-avatar'>
                        {employee.photo ? (
                          <img src={employee.photo} alt={fullName} />
                        ) : (
                          <UserOutlined />
                        )}
                      </div>
                      <div className='department-specialists-selection-item-info'>
                        <div className='department-specialists-selection-item-name'>{fullName}</div>
                        <div className='department-specialists-selection-item-specialization'>
                          {employee.specialization}
                        </div>
                        <div className='department-specialists-selection-item-appointment'>
                          Ближайшее время приёма: {getNearestAppointment(employee.id)}
                        </div>
                      </div>
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
