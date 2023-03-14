import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner, useNetwork } from 'wagmi';

import bridgeABI from '../abi/Bridge.json';
import { bridgeAddressesByChain, originalTokensByChain } from '../config';
import {
  multicallTokensDataByMethod,
  multicallGetArrayElements,
  multicallTokenData,
} from '../utils';

const useBridge = () => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const [contract, setContract] = useState();
  const [tokenList, setTokenList] = useState([]);
  const [isLoadingTokenList, setIsLoadingTokenList] = useState(false);

  // const coinAddresses = originalTokensByChain[chain?.id].map(coin => coin.address);

  const getTokenList = useCallback(async () => {
    setIsLoadingTokenList(true);

    const originalTokenList = originalTokensByChain[chain?.id].map(coin => coin.address);
    const numberOfWrappedTokens = await contract.getNumberOfWrappedTokens();
    const wrappedTokenList = await multicallGetArrayElements(
      contract.address,
      numberOfWrappedTokens,
      'wrappedTokensAddresses',
      signer,
    );

    const allTokenAddresses = [...originalTokenList, ...wrappedTokenList];

    if (allTokenAddresses.length > 0) {
      const names = await multicallTokensDataByMethod(allTokenAddresses, 'name', [], signer);
      const symbols = await multicallTokensDataByMethod(allTokenAddresses, 'symbol', [], signer);
      const userBalances = await multicallTokensDataByMethod(
        allTokenAddresses,
        'balanceOf',
        [signer._address],
        signer,
      );

      const tokenListData = allTokenAddresses.map((token, index) => {
        return {
          name: names[index],
          symbol: symbols[index],
          address: token,
          balance: userBalances[index],
        };
      });

      setTokenList(tokenListData);
      setIsLoadingTokenList(false);
    }
  }, [contract, signer, chain]);

  const deposit = async data => {
    await contract.callStatic.deposit(data);
    const borrowBookTx = await contract.deposit(data);
    await borrowBookTx.wait();
  };

  const depositWithPermit = async data => {
    await contract.callStatic.depositWithPermit(data);
    const borrowBookTx = await contract.depositWithPermit(data);
    await borrowBookTx.wait();
  };

  const claim = async data => {
    await contract.callStatic.claim(data);
    const borrowBookTx = await contract.claim(data);
    await borrowBookTx.wait();
  };

  useEffect(() => {
    if (signer && bridgeAddressesByChain[chain?.id]) {
      setContract(new ethers.Contract(bridgeAddressesByChain[chain.id], bridgeABI.abi, signer));
    }
  }, [signer, chain]);

  useEffect(() => {
    if (contract) {
      getTokenList();
    }
  }, [contract, getTokenList, chain]);

  return {
    contract,
    tokenList,
    getTokenList,
    isLoadingTokenList,
    deposit,
    depositWithPermit,
    claim,
  };
};

export default useBridge;
