import React from 'react';

import TokenSelector from './TokenSelector';
import { originalTokensByChain } from '../../config';

function TokenSelectorContainer() {
  // Todo
  const handleChange = () => {
    console.log('change');
  }

  return (
    <TokenSelector
      tokenList={originalTokensByChain}
      onChange={handleChange}
      currentBalance={1}
    />
  );
}

export default TokenSelectorContainer;
