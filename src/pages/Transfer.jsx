import React, { useState, useEffect, useCallback } from 'react';
import { useNetwork, useSigner } from 'wagmi';
import { ethers } from 'ethers';

import NetworkSwitch from '../components/NetworkSwitch';
import TokenSelectorContainer from '../components/TokenSelector/TokenSelectorContainer';
import Panel from '../components/ui/Panel';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import Modal from '../components/layout/Modal';
import ListView from '../components/ui/ListView';

import { chainList, chainsById } from '../config';
import { multicallTokenData } from '../utils';
import useBridge from '../hooks/use-bridge';

function Transfer() {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const {
    tokenList,
    isContractLoading,
    transfer,
    contractError,
    resetError,
    transactionData,
    resetTransactionData
  } = useBridge();

  const [destinationChain, setDestinationChain] = useState();
  const [destinationChainsStatus, setDestinationChainsStatus] = useState(chainList);
  const [quantity, setQuantity] = useState(0);
  const [selectedToken, setSelectedToken] = useState();
  // Validation
  const [isTransferValid, setIsTransferValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Modals
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleQuantityChange = (quantity) => {
    let quantityValue = quantity;
    if (quantity.toString().includes('.')) {
      if (quantity.toString().split('.')[1].length > 18) {
        quantityValue = Number(quantityValue).toFixed(18);
      }
    }

    setQuantity(quantityValue);
  }

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
  }

  const handleTransfer = async () => {
    await transfer(selectedToken, ethers.utils.parseEther(quantity), destinationChain);
  }

  const handleCloseConfirmationModal = useCallback(() => {
    setShowConfirmationModal(false);
    resetError();
  }, [setShowConfirmationModal, resetError]);

  const validateTransfer = useCallback(() => {
    if (selectedToken && quantity > 0 && !errorMessage && destinationChain) {
      setIsTransferValid(true);
    } else {
      setIsTransferValid(false);
    }
  }, [selectedToken, quantity, errorMessage, destinationChain]);

  const updateSelectedTokenData = useCallback(async () => {
    const data = await multicallTokenData(selectedToken.address, ['name', 'symbol', 'balanceOf'], [[], [], [signer._address]], signer);

    setSelectedToken({
      name: data[0],
      symbol: data[1],
      address: selectedToken.address,
      balance: data[2]
    });
  }, [selectedToken, signer])

  // Quantity validation
  useEffect(() => {
    setErrorMessage('');

    if (selectedToken) {
      const quantityValue = quantity || 0;
      const quantityToBigNumber = ethers.BigNumber.from(ethers.utils.parseEther(`${quantityValue}`));
      if (selectedToken?.balance?.lt(quantityToBigNumber)) {
        setErrorMessage(`Insufficient${' ' + selectedToken?.symbol + ' '}balance.`);
      }
    }
  }, [quantity, selectedToken])

  // Destination chain switch
  useEffect(() => {
    const destinationChainsNewStatus = chainList.map(chainEl => {
      if (chainEl.value === chain?.id) {
        return {...chainEl, disabled: true};
      }

      return chainEl;
    });
    const selectedDestinationChain = chainList.filter(chainEl => chainEl.value !== chain?.id);

    setDestinationChainsStatus(destinationChainsNewStatus);
    setDestinationChain(selectedDestinationChain[0]);
  }, [chain]);

  // when the token list changes select the first token from the list
  useEffect(() => {
    setSelectedToken(tokenList[0]);
  }, [tokenList]);

  // Validate transfer
  useEffect(() => {
    validateTransfer();
  }, [selectedToken, quantity, validateTransfer]);

  useEffect(() => {
    if (transactionData && quantity !== 0) {
      handleCloseConfirmationModal();
      setQuantity(0);
      updateSelectedTokenData();
    }
  }, [transactionData, handleCloseConfirmationModal, updateSelectedTokenData, quantity]);

  // Modals
  const confirmationModalActions = (
    <div className="button-split">
      <Button loading={isContractLoading} onClick={handleTransfer}>Confirm</Button>
      <Button onClick={handleCloseConfirmationModal}>Cancel</Button>
    </div>
  );

  const confirmationModal = (
    <Modal onClose={handleCloseConfirmationModal} actionBar={confirmationModalActions}>
      <>
        <div className="custom-modal__head">
          <h2 className="text-light">Confirm Deposit</h2>
        </div>

        <div className="custom-modal__body">
          <ListView
            data={{
              'Token': `${selectedToken?.name}: ${selectedToken?.address}`,
              'Transfer amount': `${quantity.toString()} ${selectedToken?.symbol}`,
              'Source Chain': chain?.name,
              'Destination Chain': destinationChain?.label
            }}
          />

          {contractError && <div className="alert alert-danger mt-4">{contractError}</div>}
        </div>
      </>
    </Modal>
  );

  const transactionSuccessModalActions = (
    <Button onClick={resetTransactionData} className="w-100">Cancel</Button>
  )

  const transactionSuccessModal = (
    <Modal onClose={handleCloseConfirmationModal} actionBar={transactionSuccessModalActions}>
      <>
        <div className="custom-modal__head">
          <h2 className="text-light">Your transaction is Successful</h2>
        </div>

        <div className="custom-modal__body">
          <ListView
            data={{
              'Transaction hash': `${transactionData?.transactionHash}`,
              'Etherscan URL': `${chainsById[chain?.id]?.blockExplorerUrl}/tx/${transactionData?.transactionHash}`
            }}
            links={['Etherscan URL']}
          />
        </div>
      </>
    </Modal>
  );

  return (
    <div className="transfer-form">
      <div className="shell-medium">
        <h1 className="text-light">Transfer</h1>

        <Panel>
          <div className="transfer-form__inner">
            <div className="transfer-form__container">
              <div className="d-flex align-items-center mb-4">
                <label>From</label>

                <NetworkSwitch onSwitch={() => setSelectedToken("")} />
              </div>

              <TokenSelectorContainer
                quantity={quantity}
                selectedToken={selectedToken}
                handleTokenSelect={handleTokenSelect}
                handleQuantityChange={handleQuantityChange}
                errorMessage={errorMessage}
              />
            </div>

            <div className="transfer-form__container">
              <div className="d-flex align-items-center">
                <label>To</label>

                <Dropdown
                  options={destinationChainsStatus}
                  value={destinationChain}
                  onChange={chain => setDestinationChain(chain)}
                />
              </div>
            </div>

            <div className="transfer-form__actions">
              {showConfirmationModal && confirmationModal}
              {transactionData && transactionSuccessModal}

              <Button disabled={!isTransferValid} onClick={() => setShowConfirmationModal(true)}>Transfer</Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default Transfer;
