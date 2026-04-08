import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import React from 'react';
import { FormField } from '../FormField/FormField';

interface CustomTextAreaProps extends TextAreaProps {
  text: string;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({ text, ...rest }) => {
  const hasValue = !!rest.value;
  return (
    <FormField label={text} hasValue={hasValue}>
      <Input.TextArea
        {...rest}
        size='large'
        style={{
          paddingTop: 'var(--widget-field-padding-top-default)',
          overflowY: 'hidden',
          resize: 'none',
          borderBottom: '1px solid var(--widget-field-line-color)',
          ...(rest.style || {}),
        }}
        variant='borderless'
        autoSize={rest.autoSize ?? { minRows: 1, maxRows: 8 }}
      />
    </FormField>
  );
};

export default CustomTextArea;
