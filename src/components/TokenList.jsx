import React from 'react';

import LoadingSpinner from './ui/LoadingSpinner';

const TokenList = ({ handleClick, tokenList, isLoadingTokenList }) => {
  const elements = tokenList.map((token, index) => {
    return <li onClick={() => handleClick(token)} key={`${token.symbol}-${index}`}>
      CircleIcon
      {token.symbol}
      {token.name}
      {token.balance.toString()}
    </li>
  });

  return (
    <>
      {isLoadingTokenList ? <LoadingSpinner /> : <ul>{elements}</ul>}
    </>
  );
};

export default TokenList;
