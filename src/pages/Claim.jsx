import React, { useContext } from 'react';

import ClaimContent from '../components/Claim/ClaimContent';
import WarningMessage from '../components/ui/WarningMessage';

import BackendAvailabilityContext from '../context/backendAvailability';

function Claim() {
  const { isBackendAvailable } = useContext(BackendAvailabilityContext);

  const backendOffline = (
    <div className="transfer-form">
      <div className="shell-medium">
        <h1 className="text-light">Claim</h1>

        <WarningMessage message="Backend is currently down! You will be able to claim your bridged tokens when the servers are back online." />
      </div>
    </div>
  );

  return (
    <>
      {
        !isBackendAvailable ?
        backendOffline :
        <ClaimContent />
      }
    </>
  );
}

export default Claim;
