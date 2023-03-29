import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useNetwork, useSigner, useAccount } from 'wagmi';

import NetworkSwitch from '../NetworkSwitch';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Connect from '../layout/Connect';
import ClaimModals from '../Claim/ClaimModals';

import useBridge from '../../hooks/use-bridge';
import { getTransactions } from '../../services/db';
import { chainsById } from '../../config';

const ClaimContent = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const { isConnected } = useAccount();

  const {
    receive,
    resetError,
    isContractLoading,
    contractError,
    transactionData,
    resetTransactionData
  } = useBridge();

  const [claimData, setClaimData] = useState();
  const [transactionToClaim, setTransactionToClaim] = useState();
  const [isClaimDataLoading, setIsClaimDataLoading] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');
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
    if (signer) {
      updateClaimData();
    }
  }, [updateClaimData, signer]);

  useEffect(() => {
    if (signer) {
      if (transactionData) {
        if (showConfirmationModal) {
          updateClaimDataStealth();
        }
        handleCloseConfirmationModal();
      }
    }
  }, [transactionData, handleCloseConfirmationModal, updateClaimDataStealth, showConfirmationModal, signer]);

  useEffect(() => {
    if (signer) {
      setTimeout(() => {
        setEmptyMessage('There are no claim transactions');
      }, 300);
    }
  }, [setEmptyMessage, signer])

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
        >{tx.isClaimed ? 'Claimed' : 'Claim'}</Button>
      </div>
    )
  });

  const handleReceive = async () => {
    await receive(transactionToClaim);
  }

  const claimContent = <>
    <NetworkSwitch />

    {
      !isClaimDataLoading ?
      info :
      <div className="spinner-container">
        <LoadingSpinner />
      </div>
    }
  </>;

  return (
    <>
      <div className="transfer-form">
        <div className="shell-medium">
          <h1 className="text-light">Claim</h1>

          <ClaimModals
            handleReceive={handleReceive}
            handleCloseConfirmationModal={handleCloseConfirmationModal}
            transactionToClaim={transactionToClaim}
            showConfirmationModal={showConfirmationModal}
            isContractLoading={isContractLoading}
            contractError={contractError}
            transactionData={transactionData}
            resetTransactionData={resetTransactionData}
          />

          {
            isConnected ?
            (
              claimData?.length > 0 || isClaimDataLoading ?
              claimContent :
              emptyMessage && <p className="text-center">{emptyMessage}</p>
            ) :
            <Connect />
          }
        </div>
      </div>
    </>
  );
};

export default ClaimContent;
