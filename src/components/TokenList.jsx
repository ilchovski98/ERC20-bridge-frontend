import React from 'react';

import LoadingSpinner from './ui/LoadingSpinner';
import TokenItem from './TokenItem';

const TokenList = ({ handleClick, tokenList, isLoadingTokenList }) => {
  const elements = tokenList.map((token, index) => {
    return (
      <li key={`${token.symbol}-${index}`}>
        <TokenItem token={token} handleClick={handleClick} />
      </li>
    )
  });

  return (
    <>
      {isLoadingTokenList ? <LoadingSpinner /> : <ul className="token-list">{elements}</ul>}
    </>
  );
};

export default TokenList;
