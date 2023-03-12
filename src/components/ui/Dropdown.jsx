import { useState, useEffect, useRef } from 'react';
import { GoChevronDown } from 'react-icons/go';

import Panel from './Panel';

function Dropdown({ options, value, onChange, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const divEl = useRef();

  useEffect(() => {
    const handler = event => {
      if (!divEl.current) {
        return;
      }

      if (!divEl.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handler, true);

    return () => document.removeEventListener('click', handler);
  }, []);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = option => {
    setIsOpen(false);
    onChange(option);
  };

  const renderedOptions = options.map(option => {
    return (
      <div
        className={`custom-dropdown__option ${option?.disabled && 'custom-dropdown__option--disabled'}`}
        key={option.value}
        onClick={() => handleOptionClick(option)}
      >
        {option.label}
      </div>
    );
  });

  return (
    <div ref={divEl} className={'custom-dropdown ' + className}>
      <Panel className="panel--border custom-dropdown__head" onClick={handleClick}>
        {value?.label || 'Select...'}
        <GoChevronDown />
      </Panel>

      {isOpen && <Panel className="custom-dropdown__body">{renderedOptions}</Panel>}
    </div>
  );
}

export default Dropdown;
