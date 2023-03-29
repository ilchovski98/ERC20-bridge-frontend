import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { GoChevronDown } from 'react-icons/go';
import { BiErrorAlt } from 'react-icons/bi';

import Field from '../ui/Field';
import Button from '../ui/Button';

import UserBalanceContext from '../../context/userBalances';

function TokenSelector({
  handleQuantityChange,
  quantity,
  currentToken,
  handleBtnClick,
  errorMessage
}) {
  const [currentTokenWithBalance, setCurrentTokenWithBalance] = useState(currentToken);
  const { getTokenBalance } = useContext(UserBalanceContext);

  const updateCurrentTokenWithBalance = useCallback(async () => {
    if (currentToken?.address) {
      const newBalance = await getTokenBalance(currentToken.address);
      const newCurrentToken = {
        ...currentToken,
        balance: newBalance
      }
      setCurrentTokenWithBalance(newCurrentToken);
    }
  }, [getTokenBalance, currentToken]);

  useEffect(() => {
    updateCurrentTokenWithBalance();
  }, [updateCurrentTokenWithBalance]);

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

          <div className="token-selector__btn-symbol">{currentTokenWithBalance?.symbol || 'ETH'}</div>

          <GoChevronDown />
        </Button>
      </div>

      {
        errorMessage &&
        <div className="token-selector__error mt-4"><BiErrorAlt /> {errorMessage}</div>
      }

      <div className="mt-4"><span>Balance:</span> <b className="text-light">{currentTokenWithBalance?.balance?.toString() ? ethers.utils.formatEther(currentTokenWithBalance?.balance?.toString()) : 0} {currentTokenWithBalance?.symbol}</b> (Max)</div>
    </div>
  );
}

export default TokenSelector;
