import React from 'react';

const Field = ({
  type = 'text',
  value,
  className = '',
  onChange
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`field ${className}`}
    />
  );
};

export default Field;
