import React from 'react';

const Field = ({
  type = 'text',
  value,
  className = '',
  onChange,
  placeholder
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`field ${className}`}
      placeholder={placeholder}
    />
  );
};

export default Field;
