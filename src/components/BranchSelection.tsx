import React, { useState } from 'react';
import { Tabs, List, Empty } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { Branch } from '../types';
import { selectBranch } from '../lib/widget-manager';
import './BranchSelection.css';

export interface BranchSelectionProps {
  branches: Branch[];
}

const BranchSelection: React.FC<BranchSelectionProps> = ({ branches }) => {
  const [activeTab, setActiveTab] = useState<string>('list');

  const handleBranchSelect = (branchId: number) => {
    selectBranch(branchId);
  };

  return (
    <div className="branch-selection">
    
      
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="branch-selection-tabs"
        items={[
          {
            key: 'list',
            label: 'Список',
            children: (
              <div className="branch-selection-content">
                {branches.length > 0 ? (
                  <List
                    dataSource={branches}
                    renderItem={(branch) => (
                      <List.Item
                        className="branch-item"
                        onClick={() => handleBranchSelect(branch.id)}
                      >
                        <div className="branch-item-content">
                          <div className="branch-item-info">
                            <div className="branch-item-name">{branch.name}</div>
                            <div className="branch-item-address">{branch.address}</div>
                          </div>
                          <RightOutlined className="branch-item-arrow" />
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Филиалы не найдены" />
                )}
              </div>
            ),
          },
          {
            key: 'map',
            label: 'На карте',
            children: (
              <div className="branch-selection-content">
                <div className="branch-map-placeholder">
                  <p>Карта будет реализована позже</p>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default BranchSelection;

