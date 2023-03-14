import React from 'react';
import { GoChevronDown } from 'react-icons/go';
import { BiErrorAlt } from 'react-icons/bi';

import Field from '../ui/Field';
import Button from '../ui/Button';

function TokenSelector({
  handleQuantityChange,
  quantity,
  currentToken,
  handleBtnClick,
  errorMessage
}) {
  return (
    <div className="token-selector">
      <div className="d-flex">
        <Field
          type="number"
          value={quantity}
          onChange={event => handleQuantityChange(event.target.value)}
          className="token-selector__field"
          placeholder="0.0"
        />

        <Button
          className="token-selector__btn"
          onClick={handleBtnClick}
        >
          <div className="token-selector__icon">
            <img src="ETH-icon.svg" alt="Token" />
          </div>

          <div className="token-selector__btn-symbol">{currentToken?.symbol || 'ETH'}</div>

          <GoChevronDown />
        </Button>
      </div>

      {
        errorMessage &&
        <div className="token-selector__error mt-4"><BiErrorAlt /> {errorMessage}</div>
      }

      <div className="mt-4"><span>Balance:</span> <b>{currentToken?.balance?.toString() || 0} {currentToken?.symbol}</b> (Max)</div>
    </div>
  );
}

export default TokenSelector;
