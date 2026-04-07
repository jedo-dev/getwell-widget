import { RightOutlined } from '@ant-design/icons';
import { List, Segmented } from 'antd';
import React, { useState } from 'react';
import { selectBranch } from '../../../lib/widget-manager';
import { EmptyState } from '../../../shared/ui';
import { Branch } from '../../../types';
import './BranchSelection.css';

export interface BranchSelectionProps {
  branches: Branch[];
  yandexMapFrameCode?: string;
}

export const BranchSelection: React.FC<BranchSelectionProps> = ({ branches, yandexMapFrameCode }) => {
  const [activeTab, setActiveTab] = useState<string>('list');
  const iframe =
    yandexMapFrameCode ||
    `<iframe
      src='https://yandex.ru/map-widget/v1/?um=constructor%3Ace51b6a918b1215aa4c3d7877ee3f86ef2edf900dc8f1cddb474d718ec719ac1&amp;source=constructor'
      width='100%'
      height='572'
      frameborder='0'></iframe>`;

  const handleBranchSelect = (branchId: number) => {
    selectBranch(branchId);
  };

  const options = [
    { label: 'Список', value: 'list' },
    { label: 'На карте', value: 'map' },
  ];

  return (
    <div className='branch-selection'>
      <Segmented
        options={options}
        value={activeTab}
        className='branch-selection-tabs-segmented'
        onChange={(value) => setActiveTab(String(value))}
      />

      <div className='branch-selection-content-holder'>
        {activeTab === 'map' ? (
          <div className='branch-selection-content'>
            <div className='branch-map-placeholder' dangerouslySetInnerHTML={{ __html: iframe }} />
          </div>
        ) : (
          <div className='branch-selection-content'>
            {branches.length > 0 ? (
              <div className='branch-selection-list'>
                <List
                  dataSource={branches}
                  renderItem={(branch) => (
                    <List.Item className='branch-item' onClick={() => handleBranchSelect(branch.id)}>
                      <div className='branch-item-content'>
                        <div className='branch-item-info'>
                          <div className='branch-item-name'>{branch.name}</div>
                          <div className='branch-item-address'>{branch.address}</div>
                        </div>
                        <RightOutlined className='branch-item-arrow' />
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <EmptyState description='������� �� �������' />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
