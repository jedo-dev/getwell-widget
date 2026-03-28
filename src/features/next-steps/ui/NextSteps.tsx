import { RightOutlined } from '@ant-design/icons';
import { List, Skeleton } from 'antd';
import { Image } from 'antd/lib';
import React from 'react';
import deparmentChoose from '../../../img/department-choose.svg';
import doctorChoose from '../../../img/doctor-choose.svg';
import {
  getWidgetState,
  goToDepartmentSelection,
  goToSpecialistSelection,
} from '../../../lib/widget-manager';
import IconWrapper from '../../../shared/ui/IconWrapper';
import { Branch } from '../../../types';
import './NextSteps.css';
export interface NextStepsProps {
  selectedBranch: Branch | null;
}

export const NextSteps: React.FC<NextStepsProps> = ({ selectedBranch }) => {
  const widgetState = getWidgetState();
  const showDepartments = widgetState.config?.showDepartments ?? true;

  const menuItems = [
    {
      key: 'specialist',
      icon: <IconWrapper size={40} iconSize={40} src={doctorChoose} />,
      title: 'Выбрать специалиста',
      onClick: () => {
        goToSpecialistSelection();
      },
    },
    ...(showDepartments
      ? [
          {
            key: 'department',
            icon: <IconWrapper size={40} iconSize={40} src={deparmentChoose} />,
            title: 'Выбрать отделение',
            onClick: () => {
              goToDepartmentSelection();
            },
          },
        ]
      : []),
  ];

  return (
    <div className='next-steps'>
      {selectedBranch && (
        <div className='next-steps-branch-card'>
          <div className='next-steps-branch-info'>
            <Image
              placeholder={<Skeleton.Avatar active={true} shape='circle' size={60} />}
              preview={false}
              src={widgetState.config?.logoUrl}
              width={60}
              height={60}
              alt={'Логотип'}
              className='next-steps-branch-image'
            />
            <div className='next-steps-branch-name'>{selectedBranch.name}</div>
            <div className='next-steps-branch-address'>{selectedBranch.address}</div>
          </div>
        </div>
      )}

      <div className='next-steps-content'>
        <List
          dataSource={menuItems}
          renderItem={(item) => (
            <List.Item className='next-steps-item' onClick={item.onClick}>
              <div className='next-steps-item-content'>
                {item.icon}
                <span className='next-steps-item-title'>{item.title}</span>
                <RightOutlined className='next-steps-item-arrow' />
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};
