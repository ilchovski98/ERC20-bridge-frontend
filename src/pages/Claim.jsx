import React, { useState, useEffect, useCallback } from 'react';
import { useNetwork, useSigner } from 'wagmi';

import NetworkSwitch from '../components/NetworkSwitch';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import useBridge from '../hooks/use-bridge';
import { getClaimData } from '../services/db';
import { chainsById } from '../config';

function Claim() {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const { receive, isContractLoading, contractError } = useBridge();
  const [claimData, setClaimData] = useState();
  const [tokenDataByChain, setTokenDataByChain] = useState();
  const [isClaimDataLoading, setIsClaimDataLoading] = useState(false);

  const handleClaimData = useCallback(async () => {
    setIsClaimDataLoading(true);
    const claimDataValue = await getClaimData(chain?.id, signer?._address);
    setClaimData(claimDataValue.claimData);
    setTokenDataByChain(claimDataValue.tokenDataByChain);
    setIsClaimDataLoading(false);
  }, [chain, setClaimData, signer]);

  useEffect(() => {
    handleClaimData();
  }, [handleClaimData]);

  const info = claimData && claimData.map((tx, index) => {
    const txArguments = tx.transaction.args;
    const fromChain = chainsById[txArguments.sourceChainId.toString()]?.label;
    const toChain = chainsById[txArguments.toChainId?.toString()]?.label;
    let tokenName;

    if (tx.transaction.event === 'LockOriginalToken') {
      const tokenData = tokenDataByChain[txArguments?.sourceChainId?.toString()][txArguments?.lockedTokenAddress];
      tokenName = 'W' + tokenData.symbol;
    } else if (tx.transaction.event === 'BurnWrappedToken') {
      if (chain?.id?.toString() === txArguments?.originalTokenChainId?.toString()) {
        // Original token
        tokenName = tokenDataByChain[chain?.id?.toString()][txArguments?.originalTokenAddress]?.symbol;
      } else {
        // Wrapped token
        tokenName = tokenDataByChain[txArguments?.sourceChainId?.toString()][txArguments?.burnedWrappedTokenAddress]?.symbol;
      }
    }

    return (
      <div className="d-flex align-items-center mb-5" key={`${index}`}>
        <p className="mx-3">From: {fromChain}</p>
        <p className="mx-3">To: {toChain}</p>
        <p className="mx-3">Token: {tokenName}</p>
        <p className="mx-3">Amount: {txArguments.value.toString()}</p>

        <Button disabled={tx.claimed} loading={isContractLoading} onClick={() => receive(tx, tokenDataByChain)}>{tx.claimed ? 'Claimed' : 'Claim'}</Button>
      </div>
    )
  });

  return (
    <div className="shell-medium">
      <h1>Claim</h1>
      <NetworkSwitch />
      {contractError && <span>{contractError}</span>}

      {!isClaimDataLoading ? info : <LoadingSpinner />}
    </div>
  );
}

export default Claim;
