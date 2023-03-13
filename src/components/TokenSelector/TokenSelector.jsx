import React from 'react';
import { GoChevronDown } from 'react-icons/go';

import Field from '../ui/Field';
import Button from '../ui/Button';

function TokenSelector({
  handleQuantityChange,
  currentBalance,
  quantity,
  currentToken,
  handleBtnClick
}) {
  return (
    <div className="token-selector">
      <div className="d-flex">
        <Field
          type="number"
          value={quantity}
          onChange={event => handleQuantityChange(event.target.value)}
          className="token-selector__field"
        />

        <Button
          className="token-selector__btn"
          onClick={handleBtnClick}
        >
          <div className="token-selector__btn-symbol">{currentToken?.symbol || 'ETH'}</div>
          <GoChevronDown />
        </Button>
      </div>

      <div className="mt-4"><span>Balance:</span> <b>{currentToken?.balance?.toString() || 0} {currentToken?.symbol}</b> (Max)</div>
    </div>
  );
}

export default TokenSelector;
