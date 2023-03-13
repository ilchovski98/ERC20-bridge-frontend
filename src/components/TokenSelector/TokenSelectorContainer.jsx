import React, { useState, useEffect } from 'react';

import TokenSelector from './TokenSelector';
import Modal from '../layout/Modal';
import TokenList from '../TokenList';

import useBridge from '../../hooks/use-bridge';

function TokenSelectorContainer() {
  const [quantity, setQuantity] = useState(0);
  const { tokenList, isLoadingTokenList } = useBridge();
  const [selectedToken, setSelectedToken] = useState();

  // Modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const doesSelectedTokenExits = tokenList.filter(token => token?.address === selectedToken?.address).length > 0;

    if (!selectedToken || !doesSelectedTokenExits) {
      setSelectedToken(tokenList[0]);
    }
  }, [tokenList, selectedToken]);

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setShowModal(false);
  }

  const handleQuantityChange = (quantity) => {
    setQuantity(quantity);
  }

  const modal = (
    <Modal onClose={() => setShowModal(false)} /*actionBar={modalActionBar}*/>
      <div className="mb-4">
        {/* {newBookModalError ? (
          <div className="alert alert-danger mt-4">{newBookModalError}</div>
        ) : null} */}

        <div className="custom-modal__head">
          <h2>Select token</h2>
        </div>

        <div className="custom-modal__body">
          <TokenList
            handleClick={handleTokenSelect}
            tokenList={tokenList}
            isLoadingTokenList={isLoadingTokenList}
          />
        </div>
      </div>
    </Modal>
  );

  return (
    <>
      {showModal && modal}

      <TokenSelector
        currentToken={selectedToken}
        quantity={quantity}
        handleQuantityChange={handleQuantityChange}
        handleBtnClick={() => setShowModal(true)}
      />
    </>
  );
}

export default TokenSelectorContainer;
