import { Select, type SelectProps } from 'antd';
import React from 'react';
import './customSeletor.css';
interface CustomSelectProps extends SelectProps {
  text: string;
}

const CustomSelector: React.FC<CustomSelectProps> = ({ text, ...rest }) => {

  const hasValue = !!rest.value;
  console.log(rest);
  return (
    <div className='input-container'>
      <div className={`custom-placeholder ${hasValue ? 'has-value' : ''}`}
      //  style={{ left: '33px' }}
       >
        {text} <span className='redmark'>*</span>
      </div>
      <Select
        {...rest}
        notFoundContent={'Выберите дату брони'}
        size='large'
        variant='borderless'
        style={{ height: '56px',width: '100%'  ,borderBottom: '1px solid #EAECF0'}}
      />
    </div>
  );
};

export default CustomSelector;
