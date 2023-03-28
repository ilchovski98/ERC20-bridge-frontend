import React, { useContext } from 'react';

import ClaimContent from '../components/Claim/ClaimContent';

import BackendAvailabilityContext from '../context/backendAvailability';

function Claim() {
  const { isBackendAvailable } = useContext(BackendAvailabilityContext);

  const backendOffline = (
    <div className="transfer-form">
      <div className="shell-medium">
        <h1 className="text-light">Claim</h1>

        <span>Backend is offline</span>
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
