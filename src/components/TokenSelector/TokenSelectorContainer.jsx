import React, { useState, useContext, useEffect, useCallback } from 'react';

import TokenSelector from './TokenSelector';
import Modal from '../layout/Modal';
import TokenList from '../ui/TokenList';
import TokenSearch from '../TokenSearch';

import useBridge from '../../hooks/use-bridge';
import UserBalanceContext from '../../context/userBalances';

function TokenSelectorContainer({
  quantity,
  handleQuantityChange,
  selectedToken,
  handleTokenSelect,
  errorMessage
}) {
  const [showModal, setShowModal] = useState(false);
  const { tokenList, getTokenBalance } = useContext(UserBalanceContext);
  const { isContractLoading } = useBridge();
  const [ tokenListWithBalances, setTokenListWithBalances ] = useState(tokenList);

  const handleTokenSelectAndCloseModal = (token) => {
    handleTokenSelect(token);
    setShowModal(false);
  }

  const createTokenListWithBalances = useCallback(async () => {
    const newTokenList = [];

    for (let i = 0; i < tokenList.length; i++) {
      const balance = await getTokenBalance(tokenList[i].address)

      newTokenList.push({
        ...tokenList[i],
        balance
      });
    }

    setTokenListWithBalances(newTokenList);
  }, [tokenList, getTokenBalance, setTokenListWithBalances]);

  useEffect(() => {
    createTokenListWithBalances()
  }, [createTokenListWithBalances])

  const modal = (
    <Modal onClose={() => setShowModal(false)}>
      <div className="mb-4">
        <div className="custom-modal__head">
          <h2 className="text-light">Select token</h2>
        </div>

        <div className="custom-modal__body">
          <TokenSearch
            handleTokenConfirm={handleTokenSelectAndCloseModal}
            handleTokenCancel={() => setShowModal(false)}
          />

          <TokenList
            handleClick={handleTokenSelectAndCloseModal}
            tokenList={tokenListWithBalances}
            isLoadingTokenList={isContractLoading}
            className="mt-4"
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
        errorMessage={errorMessage}
      />
    </>
  );
}

export default TokenSelectorContainer;
