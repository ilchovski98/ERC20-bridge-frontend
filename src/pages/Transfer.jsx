import React, { useContext } from 'react';

import TransferContent from '../components/Transfer/TransferContent';

import BackendAvailabilityContext from '../context/backendAvailability';

function Transfer() {
  const { isBackendAvailable } = useContext(BackendAvailabilityContext);

  return (
    <>
      <TransferContent isBackendAvailable={isBackendAvailable} />
    </>
  );
}

export default Transfer;
