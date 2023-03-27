import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useNetwork, useSigner } from 'wagmi';

import NetworkSwitch from '../components/NetworkSwitch';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/layout/Modal';
import ListView from '../components/ui/ListView';

import useBridge from '../hooks/use-bridge';
import { getTransactions } from '../services/db';
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
  const [isClaimDataLoading, setIsClaimDataLoading] = useState(false);
  // Modals
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const updateClaimData = useCallback(async () => {
    setIsClaimDataLoading(true);
    const claimDataValue = await getTransactions(chain?.id, signer?._address);
    setClaimData(claimDataValue);
    setIsClaimDataLoading(false);
  }, [chain, setClaimData, signer]);

  const updateClaimDataStealth = useCallback(async () => {
    const claimDataValue = await getTransactions(chain?.id, signer?._address);
    setClaimData(claimDataValue);
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
      if (showConfirmationModal) {
        updateClaimDataStealth();
      }
      handleCloseConfirmationModal();
    }
  }, [transactionData, handleCloseConfirmationModal, updateClaimDataStealth, showConfirmationModal]);

  const info = claimData && claimData?.map((tx, index) => {
    const fromChain = chainsById[tx.fromChain]?.label;
    const toChain = chainsById[tx.toChain]?.label;
    const tokenSymbol = tx?.claimData?.targetTokenSymbol;

    return (
      <div className="d-flex align-items-center justify-content-between mb-5 mt-4" key={`${index}`}>
        <p className="mx-3">From: <span className="text-light">{fromChain}</span></p>
        <p className="mx-3">To: <span className="text-light">{toChain}</span></p>
        <p className="mx-3">Token: <span className="text-light">{tokenSymbol}</span></p>
        <p className="mx-3">Amount: <span className="text-light">{ethers.utils.formatEther(tx.claimData.value)}</span></p>

        <Button
          disabled={tx.isClaimed}
          className="btn--width-medium"
          onClick={() => {
            setTransactionToClaim(tx)
            setShowConfirmationModal(true)
          }}
        >{tx.claimed ? 'Claimed' : 'Claim'}</Button>
      </div>
    )
  });

  const handleReceive = async () => {
    await receive(transactionToClaim);
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
              'Token': transactionToClaim?.claimData?.targetTokenName,
              'Amount': transactionToClaim?.claimData?.value ? ethers.utils.formatEther(transactionToClaim?.claimData?.value) + ` ${transactionToClaim?.claimData?.targetTokenSymbol}`: '',
              'From': `${chainsById[transactionToClaim?.fromChain?.toString()]?.label}`,
              'To': `${chainsById[transactionToClaim?.toChain?.toString()]?.label}`
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
    <div className="transfer-form">
      <div className="shell-medium">
        <h1 className="text-light">Claim</h1>
        <NetworkSwitch />

        {showConfirmationModal && confirmationModal}
        {transactionData && transactionSuccessModal}

        {
          !isClaimDataLoading ?
          info :
          <div className="spinner-container">
            <LoadingSpinner />
          </div>
        }
      </div>
    </div>
  );
}

export default Claim;
