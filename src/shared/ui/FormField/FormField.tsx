import React from 'react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  required?: boolean;
  hasValue?: boolean;
  isActive?: boolean;
  hidePlaceholderWhenActive?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  hasValue = false,
  isActive = false,
  hidePlaceholderWhenActive = true,
  children,
}) => {
  const isLabelActive = hasValue || isActive;
  const shouldHideLabel = hidePlaceholderWhenActive && isLabelActive;

  return (
    <div className='gw-field-container'>
      <div
        className={`gw-field-placeholder ${isLabelActive ? 'gw-field-placeholder--active' : ''} ${
          shouldHideLabel ? 'gw-field-placeholder--hidden' : ''
        }`}>
        {label} {required && <span className='gw-field-required'>*</span>}
      </div>
      {children}
    </div>
  );
};
