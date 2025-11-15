import { AppstoreOutlined, HomeOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { List } from 'antd';
import React from 'react';
import { goToSpecialistSelection } from '../lib/widget-manager';
import { Branch } from '../types';
import './NextSteps.css';

export interface NextStepsProps {
  selectedBranch: Branch | null;
}

const NextSteps: React.FC<NextStepsProps> = ({ selectedBranch }) => {
  const menuItems = [
    {
      key: 'specialist',
      icon: <UserOutlined className="next-steps-item-icon" />,
      title: 'Выбрать специалиста',
      onClick: () => {
        goToSpecialistSelection();
      },
    },
    {
      key: 'department',
      icon: <AppstoreOutlined className="next-steps-item-icon" />,
      title: 'Выбрать отделение',
      onClick: () => {
        // TODO: Переход к выбору отделения
        console.log('Выбор отделения');
      },
    },
  ];

  return (
    <div className="next-steps">
      {selectedBranch && (
        <div className="next-steps-branch-card">
          <HomeOutlined className="next-steps-branch-icon" />
          <div className="next-steps-branch-info">
            <div className="next-steps-branch-name">{selectedBranch.name}</div>
            <div className="next-steps-branch-address">{selectedBranch.address}</div>
          </div>
        </div>
      )}

      <div className="next-steps-content">
        <List
          dataSource={menuItems}
          renderItem={(item) => (
            <List.Item
              className="next-steps-item"
              onClick={item.onClick}
            >
              <div className="next-steps-item-content">
                {item.icon}
                <span className="next-steps-item-title">{item.title}</span>
                <RightOutlined className="next-steps-item-arrow" />
              </div>
            </List.Item>
          )}
        />
      </div>

      <div className="next-steps-image-placeholder">
        <p>Изображение будет добавлено позже</p>
      </div>
    </div>
  );
};

export default NextSteps;

