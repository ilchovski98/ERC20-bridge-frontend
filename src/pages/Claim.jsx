import React, { useState, useEffect, useCallback } from 'react';
import { useNetwork, useSigner } from 'wagmi';

import NetworkSwitch from '../components/NetworkSwitch';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/layout/Modal';
import ListView from '../components/ListView';

import useBridge from '../hooks/use-bridge';
import { getClaimData } from '../services/db';
import { chainsById } from '../config';

function Claim() {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const {
    receive,
    isContractLoading,
    contractError,
    resetError,
    transactionData,
    resetTransactionData
  } = useBridge();

  const [claimData, setClaimData] = useState();
  const [transactionToClaim, setTransactionToClaim] = useState();
  const [tokenDataByChain, setTokenDataByChain] = useState();
  const [isClaimDataLoading, setIsClaimDataLoading] = useState(false);
  // Modals
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const updateClaimData = useCallback(async () => {
    setIsClaimDataLoading(true);
    const claimDataValue = await getClaimData(chain?.id, signer?._address);
    setClaimData(claimDataValue.claimData);
    setTokenDataByChain(claimDataValue.tokenDataByChain);
    setIsClaimDataLoading(false);
  }, [chain, setClaimData, signer]);

  const updateClaimDataStealth = useCallback(async () => {
    const claimDataValue = await getClaimData(chain?.id, signer?._address);
    setClaimData(claimDataValue.claimData);
    setTokenDataByChain(claimDataValue.tokenDataByChain);
  }, [chain, setClaimData, signer]);

  const handleCloseConfirmationModal = useCallback(() => {
    setShowConfirmationModal(false);
    resetError();
  }, [setShowConfirmationModal, resetError]);

  useEffect(() => {
    updateClaimData();
  }, [updateClaimData]);

  useEffect(() => {
    if (transactionData) {
      handleCloseConfirmationModal();
      updateClaimDataStealth();
    }
  }, [transactionData, handleCloseConfirmationModal, updateClaimDataStealth]);

  const info = claimData && claimData.map((tx, index) => {
    const txArguments = tx.transaction.args;
    const fromChain = chainsById[txArguments.sourceChainId.toString()]?.label;
    const toChain = chainsById[txArguments.toChainId?.toString()]?.label;
    let tokenName, tokenSymbol;

    if (tx.transaction.event === 'LockOriginalToken') {
      const tokenData = tokenDataByChain[txArguments?.sourceChainId?.toString()][txArguments?.lockedTokenAddress];
      tokenSymbol = 'W' + tokenData?.symbol;
      tokenName = 'Wrapped ' + tokenData?.name;
    } else if (tx.transaction.event === 'BurnWrappedToken') {
      if (chain?.id?.toString() === txArguments?.originalTokenChainId?.toString()) {
        // Original token
        const tokenData = tokenDataByChain[chain?.id?.toString()][txArguments?.originalTokenAddress];
        tokenSymbol = tokenData?.symbol;
        tokenName = tokenData?.name;
      } else {
        // Wrapped token
        const tokenData = tokenDataByChain[txArguments?.sourceChainId?.toString()][txArguments?.burnedWrappedTokenAddress];
        tokenSymbol = tokenData?.symbol;
        tokenName = tokenData?.name;
      }
    }

    return (
      <div className="d-flex align-items-center mb-5" key={`${index}`}>
        <p className="mx-3">From: {fromChain}</p>
        <p className="mx-3">To: {toChain}</p>
        <p className="mx-3">Token: {tokenSymbol}</p>
        <p className="mx-3">Amount: {txArguments.value.toString()}</p>

        <Button
          disabled={tx.claimed}
          loading={isContractLoading}
          onClick={() => {
            setTransactionToClaim({tx: tx.transaction, tokenSymbol, tokenName}) // Todo refactor to not use tokenName, tokenSymbol
            setShowConfirmationModal(true)
            // receive(tx, tokenDataByChain);
          }}
        >{tx.claimed ? 'Claimed' : 'Claim'}</Button>
      </div>
    )
  });

  const handleReceive = async () => {
    await receive(transactionToClaim.tx, tokenDataByChain); // Todo refactor to not use tokenDataByChain
  }

  // Todo find a way to reuse all these modals if possible - research
  const confirmationModalActions = (
    <div className="button-split">
      <Button loading={isContractLoading} onClick={handleReceive}>Confirm</Button>
      <Button onClick={handleCloseConfirmationModal}>Cancel</Button>
    </div>
  )

  const confirmationModal = (
    <Modal onClose={handleCloseConfirmationModal} actionBar={confirmationModalActions}>
      <>
        <div className="custom-modal__head">
          <h2 className="text-light">Confirm Claim</h2>
        </div>

        <div className="custom-modal__body">
          <ListView
            data={{
              'Token': transactionToClaim?.tokenName,
              'Amount': transactionToClaim?.tx?.args?.value?.toString() + ` ${transactionToClaim?.tokenSymbol}`,
              'From': `${chainsById[transactionToClaim?.tx?.args?.sourceChainId?.toString()]?.label}`,
              'To': `${chainsById[transactionToClaim?.tx?.args?.toChainId?.toString()]?.label}`
            }}
          />

          {contractError && <div className="alert alert-danger mt-4">{contractError}</div>}
        </div>
      </>
    </Modal>
  );

  const transactionSuccessModalActions = (
    <Button onClick={resetTransactionData} className="w-100">Cancel</Button>
  );

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
    <div className="shell-medium">
      <h1>Claim</h1>
      <NetworkSwitch />

      {showConfirmationModal && confirmationModal}
      {transactionData && transactionSuccessModal}

      {!isClaimDataLoading ? info : <LoadingSpinner />}
    </div>
  );
}

export default Claim;
