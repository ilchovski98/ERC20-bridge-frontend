  import React, { useState, useEffect, useCallback } from 'react';
import { useNetwork } from 'wagmi';

import NetworkSwitch from '../components/NetworkSwitch';
import TokenSelectorContainer from '../components/TokenSelector/TokenSelectorContainer';
import Panel from '../components/ui/Panel';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import Modal from '../components/layout/Modal';

import { chainList } from '../config';
import useBridge from '../hooks/use-bridge';

function Transfer() {
  // depositData = {
  //   from: {
  //     _address: userAccount1.address,  - done
  //     chainId: chainId                 - done
  //   },
  //   to: {
  //     _address: userAccount1.address,  - done
  //     chainId: chainId                 - done
  //   },
  //   spender: bridge1.address,          - done
  //   token: token.address,              - done
  //   value: value,                      - done
  //   deadline: deadline,                - hardcore to 1h
  //   approveTokenTransferSig: {
  //     v: approveSignature.v,
  //     r: approveSignature.r,
  //     s: approveSignature.s
  //   }
  // };
  const [destinationChain, setDestinationChain] = useState();
  const [destinationChainsStatus, setDestinationChainsStatus] = useState(chainList);
  const [quantity, setQuantity] = useState(0);
  const [selectedToken, setSelectedToken] = useState();
  const { tokenList, isLoadingTokenList } = useBridge();

  // Validation
  const [isTransferValid, setIsTransferValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Confirmation modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const { chain } = useNetwork();

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
  }

  const handleQuantityChange = (quantity) => {
    setQuantity(quantity);
  }

  const validateTransfer = useCallback(() => {
    if (selectedToken && quantity > 0 && !errorMessage && destinationChain) {
      setIsTransferValid(true);
    } else {
      setIsTransferValid(false);
    }
  }, [selectedToken, quantity, errorMessage, destinationChain]);

  // Quantity validation
  useEffect(() => {
    setErrorMessage('');

    if (selectedToken) {
      const tokenBalanceNumber = selectedToken?.balance?.toNumber();
      if (quantity > tokenBalanceNumber) {
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

  // If there is no selected token select the first token from the list
  useEffect(() => {
    if (!selectedToken) {
      setSelectedToken(tokenList[0]);
    }
  }, [tokenList, selectedToken]);

  // Validate transfer
  useEffect(() => {
    validateTransfer();
  }, [selectedToken, quantity, validateTransfer]);

  const modalActions = [
    <Button>Confirm</Button>,
    <Button onClick={() => setShowConfirmationModal(false)}>Cancel</Button>,
  ];

  const modal = (
    <Modal onClose={() => setShowConfirmationModal(false)} actionBar={modalActions}>
      <div className="mb-4">
        <div className="custom-modal__head">
          <h2>Please Confirm</h2>
        </div>

        <div className="custom-modal__body">
          Token Name: {selectedToken?.name}
          Token Symbol:{selectedToken?.symbol}
          Quantity: {quantity}
          Source Chain: {chain.name}
          Destination Chain: {destinationChain.label}
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="transfer-form">
      <div className="shell-medium">
        <h1>Transfer</h1>

        <Panel>
          <div className="transfer-form__inner">
            <div className="transfer-form__container">
              <div className="d-flex align-items-center mb-4">
                <label>From</label>

                <NetworkSwitch onSwitch={() => setSelectedToken("")} />
              </div>

              <TokenSelectorContainer
                quantity={quantity}
                tokenList={tokenList}
                selectedToken={selectedToken}
                handleTokenSelect={handleTokenSelect}
                isLoadingTokenList={isLoadingTokenList}
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
              {showConfirmationModal && modal}

              <Button disabled={!isTransferValid} onClick={() => setShowConfirmationModal(true)}>Transfer</Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default Transfer;
