import React, { useState, useMemo } from 'react';
import { Tabs, Input, List, Radio, Button, Empty } from 'antd';
import { SearchOutlined, LeftOutlined, UserOutlined } from '@ant-design/icons';
import { Employee } from '../types';
import { selectEmployee, goToDateTimeSelection, goBack } from '../lib/widget-manager';
import './SpecialistSelection.css';

export interface SpecialistSelectionProps {
  employees: Employee[];
  selectedEmployeeId: number | null;
}

const SpecialistSelection: React.FC<SpecialistSelectionProps> = ({ employees, selectedEmployeeId }) => {
  const [activeTab, setActiveTab] = useState<string>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }

    const query = searchQuery.toLowerCase();
    return employees.filter(emp => {
      const fullName = `${emp.lastName} ${emp.firstName} ${emp.patronymic || ''}`.toLowerCase();
      const specialization = emp.specialization.toLowerCase();
      return fullName.includes(query) || specialization.includes(query);
    });
  }, [employees, searchQuery]);

  const handleEmployeeSelect = (employeeId: number) => {
    selectEmployee(employeeId);
  };

  const handleSelectDateTime = () => {
    goToDateTimeSelection();
  };

  const handleBack = () => {
    goBack();
  };

  const selectedEmployee = selectedEmployeeId
    ? employees.find(emp => emp.id === selectedEmployeeId)
    : null;

  // Временные данные для ближайшего времени приёма (заглушка)
  const getNearestAppointment = (employeeId: number): string => {
    // TODO: В будущем здесь будет запрос к API
    return 'сегодня';
  };

  return (
    <div className="specialist-selection">
      <div className="specialist-selection-header">
        <LeftOutlined className="specialist-selection-back" onClick={handleBack} />
        <h2 className="specialist-selection-title">Выберите специалиста</h2>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="specialist-selection-tabs"
        items={[
          {
            key: 'name',
            label: 'По ФИО',
            children: (
              <div className="specialist-selection-content">
                <Input
                  placeholder="Поиск"
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="specialist-selection-search"
                />

                {filteredEmployees.length > 0 ? (
                  <List
                    className="specialist-selection-list"
                    dataSource={filteredEmployees}
                    renderItem={(employee) => {
                      const isSelected = selectedEmployeeId === employee.id;
                      const fullName = `${employee.lastName} ${employee.firstName} ${employee.patronymic || ''}`.trim();

                      return (
                        <List.Item
                          className={`specialist-selection-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleEmployeeSelect(employee.id)}
                        >
                          <div className="specialist-selection-item-content">
                            <div className="specialist-selection-item-left">
                              <div className="specialist-selection-avatar">
                                {employee.photo ? (
                                  <img src={employee.photo} alt={fullName} />
                                ) : (
                                  <UserOutlined />
                                )}
                              </div>
                              <div className="specialist-selection-item-info">
                                <div className="specialist-selection-item-name">{fullName}</div>
                                <div className="specialist-selection-item-specialization">
                                  {employee.specialization}
                                </div>
                                <div className="specialist-selection-item-appointment">
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
                  <Empty description="Специалисты не найдены" />
                )}
              </div>
            ),
          },
          {
            key: 'department',
            label: 'По отделению',
            children: (
              <div className="specialist-selection-content">
                <Empty description="Выбор по отделению будет реализован позже" />
              </div>
            ),
          },
        ]}
      />

      {selectedEmployee && (
        <div className="specialist-selection-footer">
          <Button className="specialist-selection-footer-btn secondary">
            О враче
          </Button>
          <Button
            type="primary"
            className="specialist-selection-footer-btn primary"
            onClick={handleSelectDateTime}
          >
            Выбрать дату и время
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpecialistSelection;

