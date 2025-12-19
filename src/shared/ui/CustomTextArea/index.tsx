import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import React from 'react';


interface CustomTextAreaProps extends TextAreaProps {
  text: string;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({ text, ...rest }) => {
  const hasValue = !!rest.value;
  return (
    <div className='input-container'>
      <div className={`custom-placeholder ${hasValue ? 'has-value' : ''}`}>
        {text} <span className='redmark'></span>
      </div>
      <Input.TextArea
        {...rest}
        size='large'

        style={{
          paddingTop: `${hasValue ? '18px' : '12px'}`,
          overflowY: 'auto',
          resize: 'none',
          borderBottom: '1px solid var(--widget-border-secondary)'
        }}
         variant='borderless'
        rows={1}
        maxLength={100}
      />
    </div>
  );
};

export default CustomTextArea;
