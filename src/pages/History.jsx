import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useNetwork, useSigner } from 'wagmi';

import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/layout/Modal';
import ListView from '../components/ui/ListView';

import { getUserHistory } from '../services/db';
import { chainsById } from '../config';

function Claim() {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const [claimData, setClaimData] = useState();
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  // Modals
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const updateClaimData = useCallback(async () => {
    if (signer) {
      setIsHistoryLoading(true);
      const claimDataValue = await getUserHistory(signer?._address);
      setClaimData(claimDataValue);
      setIsHistoryLoading(false);
    }
  }, [setClaimData, signer]);

  useEffect(() => {
    updateClaimData();
  }, [updateClaimData]);

  const info = claimData && claimData?.map((tx, index) => {
    const fromChain = chainsById[tx.fromChain]?.label;
    const toChain = chainsById[tx.toChain]?.label;
    const tokenSymbol = tx?.claimData?.targetTokenSymbol;

    return (
      <div className="d-flex align-items-center justify-content-between mb-5 mt-4" key={`${index}`}>
        <p className="mx-3">Chains: <span className="text-light">{fromChain}</span> ➡️ <span className="text-light">{toChain}</span></p>
        <p className="mx-3">Token: <span className="text-light">{tokenSymbol}</span> ➡️ <span className="text-light">{tokenSymbol}</span></p>
        <p className="mx-3">Amount: <span className="text-light">{ethers.utils.formatEther(tx.claimData.value)}</span></p>
        <p>{tx.isClaimed ? 'Claimed' : 'Not Claimed'}</p>
      </div>
    )
  });

  // // Todo find a way to reuse all these modals if possible - research
  // const confirmationModalActions = (
  //   <div className="button-split">
  //     <Button loading={isContractLoading} onClick={handleReceive}>Confirm</Button>
  //     <Button onClick={handleCloseConfirmationModal}>Cancel</Button>
  //   </div>
  // )

  // const confirmationModal = (
  //   <Modal onClose={handleCloseConfirmationModal} actionBar={confirmationModalActions}>
  //     <>
  //       <div className="custom-modal__head">
  //         <h2 className="text-light">Confirm Claim</h2>
  //       </div>

  //       <div className="custom-modal__body">
  //         <ListView
  //           data={{
  //             'Token': transactionToClaim?.claimData?.targetTokenName,
  //             'Amount': transactionToClaim?.claimData?.value ? ethers.utils.formatEther(transactionToClaim?.claimData?.value) + ` ${transactionToClaim?.claimData?.targetTokenSymbol}`: '',
  //             'From': `${chainsById[transactionToClaim?.fromChain?.toString()]?.label}`,
  //             'To': `${chainsById[transactionToClaim?.toChain?.toString()]?.label}`
  //           }}
  //         />

  //         {contractError && <div className="alert alert-danger mt-4">{contractError}</div>}
  //       </div>
  //     </>
  //   </Modal>
  // );

  return (
    <div className="transfer-form">
      <div className="shell-medium">
        <h1 className="text-light">History</h1>

        {/* {showConfirmationModal && confirmationModal} */}

        {
          !isHistoryLoading ?
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
