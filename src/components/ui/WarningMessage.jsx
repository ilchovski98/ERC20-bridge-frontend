import React from 'react';
import { GoAlert } from "react-icons/go";

const WarningMessage = ({ className, message }) => {
  return (
    <div className={`warning-message ${className}`}>
      <div className="warning-message__content">
        <div className="warning-message__icon"><GoAlert /></div>
        <p>{ message }</p>
      </div>
    </div>
  );
};

export default WarningMessage;
