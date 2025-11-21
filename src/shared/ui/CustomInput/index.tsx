import { Input, type InputProps } from 'antd';
import React from 'react';

interface CustomInputProps extends InputProps {
  text: string;

}

const CustomInput: React.FC<CustomInputProps> = ({
  text,

  ...rest
}) => {

  const hasValue = !!rest.value;
  return (

    <div className='input-container'>
      <div className={`custom-placeholder ${hasValue ? 'has-value' : ''}`}>
        {text} {text && <span className='redmark'>*</span>}
      </div>
      <Input
        {...rest}
        size='large'
          variant='borderless'
        style={{ height: '56px',borderBottom: '1px solid #EAECF0', paddingTop: `${hasValue ? '18px' : '12px'}` }}
      />
    </div>
  );
};

export default CustomInput;
