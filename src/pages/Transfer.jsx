import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNetwork, useSigner, useAccount } from 'wagmi';
import { ethers } from 'ethers';

import NetworkSwitch from '../components/NetworkSwitch';
import TokenSelectorContainer from '../components/TokenSelector/TokenSelectorContainer';
import Panel from '../components/ui/Panel';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import Connect from '../components/layout/Connect';
import TransferModals from '../components/Transfer/TransferModals';

import { chainList } from '../config';
import { multicallTokenData } from '../utils';
import useBridge from '../hooks/use-bridge';
import UserBalanceContext from '../context/userBalances';

function Transfer() {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const { isConnected } = useAccount();

  const {
    transfer,
    resetError,
    transactionData,
  } = useBridge();

  const { tokenList } = useContext(UserBalanceContext);

  const [destinationChain, setDestinationChain] = useState();
  const [destinationChainsStatus, setDestinationChainsStatus] = useState(chainList);
  const [quantity, setQuantity] = useState(0);
  const [selectedToken, setSelectedToken] = useState();
  const [isDefaultTokenSelected, setIsDefaultTokenSelected] = useState();
  const [isTransferValid, setIsTransferValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
    if (signer) {
      const data = await multicallTokenData(selectedToken.address, ['name', 'symbol', 'balanceOf'], [[], [], [signer._address]], signer);

      setSelectedToken({
        name: data[0],
        symbol: data[1],
        address: selectedToken.address,
        balance: data[2]
      });
    }
  }, [selectedToken, signer]);

  const setDefaultToken = useCallback(() => {
    setSelectedToken(tokenList[0]);
    setIsDefaultTokenSelected(true);
  }, [tokenList]);

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

  // change only once on chain and signer change
  useEffect(() => {
    if (!isDefaultTokenSelected) {
      setDefaultToken();
    }
  }, [chain, signer, setDefaultToken, isDefaultTokenSelected]);

  useEffect(() => {
    if (!selectedToken?.name) {
      if (tokenList?.length > 0) {
        setDefaultToken();
      }
    }
  }, [tokenList, selectedToken, setDefaultToken])

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

  const transferContent = <Panel>
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
        <TransferModals
          handleTransfer={handleTransfer}
          handleCloseConfirmationModal={handleCloseConfirmationModal}
          selectedToken={selectedToken}
          quantity={quantity}
          destinationChain={destinationChain}
          showConfirmationModal={showConfirmationModal}
        />

        <Button disabled={!isTransferValid} onClick={() => setShowConfirmationModal(true)}>Transfer</Button>
      </div>
    </div>
  </Panel>;

  return (
    <div className="transfer-form">
      <div className="shell-medium">
        <h1 className="text-light">Transfer</h1>

        {
          isConnected ?
          transferContent :
          <Connect />
        }
      </div>
    </div>
  );
}

export default Transfer;
