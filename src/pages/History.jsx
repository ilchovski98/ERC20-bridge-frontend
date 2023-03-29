import React, { useContext } from 'react';

import HistoryContent from '../components/History/HistoryContent';
import WarningMessage from '../components/ui/WarningMessage';

import BackendAvailabilityContext from '../context/backendAvailability';

function Claim() {
  const { isBackendAvailable } = useContext(BackendAvailabilityContext);

  const backendOffline = (
    <div className="transfer-form">
      <div className="shell-medium">
        <h1 className="text-light">History</h1>

        <WarningMessage message="Backend is currently down. You will be able to see your history when the servers are back online." />
      </div>
    </div>
  );

  return (
    <>
      {
        !isBackendAvailable ?
        backendOffline :
        <HistoryContent />
      }
    </>
  );
}

export default Claim;
