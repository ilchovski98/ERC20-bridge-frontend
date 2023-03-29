import React from 'react';
import { ethers } from 'ethers';

const TokenItem = ({ token, handleClick, className }) => {
  return (
    <div onClick={() => handleClick(token)} className={`token-item ${className}`}>
      <div className="token-item__image">
        <img src="ETH-icon.svg" alt="Token" />
      </div>

      <div className="token-item__content">
        <h3 className="token-item__symbol">{token?.symbol}</h3>

        <span className="token-item__name">{token?.name}</span>
      </div>

      <div className="token-item__balance">
        <span className="token-item__balance-value">{token?.balance?.toString() ? ethers.utils.formatEther(token?.balance.toString()) : 0}</span>
      </div>
    </div>
  );
};

export default TokenItem;
