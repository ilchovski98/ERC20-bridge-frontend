import React from 'react';
import { useNetwork } from 'wagmi';

import Modal from '../layout/Modal';
import ListView from '../ui/ListView';
import Button from '../ui/Button';

import { chainsById } from '../../config';

const TransferModals = ({
  handleTransfer,
  handleCloseConfirmationModal,
  selectedToken,
  quantity,
  destinationChain,
  showConfirmationModal,
  isContractLoading,
  contractError,
  transactionData,
  resetTransactionData
}) => {
  const { chain } = useNetwork();

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
    <>
      {showConfirmationModal && confirmationModal}
      {transactionData && transactionSuccessModal}
    </>
  );
};

export default TransferModals;
