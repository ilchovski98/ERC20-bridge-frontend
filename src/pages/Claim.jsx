import React from 'react';
import { useBlockNumber, useNetwork, useSigner } from 'wagmi';

import Button from '../components/ui/Button';
import useBridge from '../hooks/use-bridge';
import { loadChainsDataToLocalStorage, getClaimTxOfUserOnTargetChain } from '../services/db';

function Claim() {
  const { contract } = useBridge();
  const { data, isError, isLoading } = useBlockNumber();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const handleEvents = async () => {
    // Todo block number is not updating must refresh connect wallet and then it updates
    console.log('data', data);
    // const result = contract.filters.LockOriginalToken('0x9a7F208A777ed19233380959c4028c99886c5843')
    const result = await contract.queryFilter('LockOriginalToken', 3082523, data);
    console.log('result', result);
  }

  return (
    <>
      <p>Claim</p>
      <Button onClick={handleEvents}>Result</Button>
      <Button onClick={loadChainsDataToLocalStorage}>ChainData</Button>
      <Button onClick={() => getClaimTxOfUserOnTargetChain(chain?.id, signer._address)}>Get Claim Tx data towards targetchain</Button>
    </>
  );
}

export default Claim;
