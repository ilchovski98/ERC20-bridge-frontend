import React from 'react';
import { ethers } from 'ethers';
import { useNetwork } from 'wagmi';

import Modal from '../layout/Modal';
import ListView from '../ui/ListView';
import Button from '../ui/Button';
import { chainsById } from '../../config';

const ClaimModals = ({
  handleReceive,
  handleCloseConfirmationModal,
  transactionToClaim,
  showConfirmationModal,
  isContractLoading,
  contractError,
  transactionData,
  resetTransactionData
}) => {
  const { chain } = useNetwork();

  const confirmationModalActions = (
    <div className="button-split">
      <Button loading={isContractLoading} onClick={handleReceive}>Confirm</Button>
      <Button onClick={handleCloseConfirmationModal}>Cancel</Button>
    </div>
  );

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
    <>
      {showConfirmationModal && confirmationModal}
      {transactionData && transactionSuccessModal}
    </>
  );
};

export default ClaimModals;
