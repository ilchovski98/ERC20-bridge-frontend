import React from 'react';

function TokenSelector({ onChange, currentBalance, tokenList }) {
  // Todo
  return (
    <>
      <input type="text" onChange={onChange} />
      dropdown
      current balance: {currentBalance}
    </>
  );
}

export default TokenSelector;
