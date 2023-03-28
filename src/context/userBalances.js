import { createContext, useState, useEffect, useCallback } from 'react';
import { useSigner, useNetwork } from 'wagmi';

import useBridge from '../hooks/use-bridge';
import {
  multicallTokensDataByMethod,
  multicallGetArrayElements,
  signPermitData,
  signClaimData,
  handleErrorMessage,
} from '../utils';
import { bridgeAddressesByChain, originalTokensByChain } from '../config';

const UserBalanceContext = createContext();

function UserBalanceProvider({ children }) {
  const [tokenList, setTokenList] = useState([]);
  const [allTokenAddresses, setAllTokenAddresses] = useState();

  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const { contract } = useBridge();

  const updateTokenData = useCallback(async () => {
    if (!signer) return;
    if (allTokenAddresses?.length > 0) {
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
    }
  }, [signer, allTokenAddresses]);

  const handleNetworkChange = useCallback(async () => {
    if (contract && signer && chain) {
      const originalTokenList = originalTokensByChain[chain?.id]?.map(coin => coin.address);
      const numberOfWrappedTokens = (await contract.getNumberOfWrappedTokens())?.toNumber();

      const wrappedTokenList = await multicallGetArrayElements(
        contract.address,
        numberOfWrappedTokens,
        'wrappedTokens',
        signer,
      );

      const finalTokenList = [...originalTokenList, ...wrappedTokenList];

      const names = await multicallTokensDataByMethod(finalTokenList, 'name', [], signer);
      const symbols = await multicallTokensDataByMethod(finalTokenList, 'symbol', [], signer);
      const userBalances = await multicallTokensDataByMethod(
        finalTokenList,
        'balanceOf',
        [signer._address],
        signer,
      );

      const tokenListData = finalTokenList.map((token, index) => {
        return {
          name: names[index],
          symbol: symbols[index],
          address: token,
          balance: userBalances[index],
        };
      });

      setAllTokenAddresses(finalTokenList);
      setTokenList(tokenListData);
    }
  }, [chain, contract, signer]);

  useEffect(() => {
    handleNetworkChange();
  }, [handleNetworkChange]);

  useEffect(() => {
    const provider = signer?.provider;
    if (signer) {
      provider.on('block', async () => {
        updateTokenData();
      });
    }

    return () => provider?.off('block');
  }, [signer, updateTokenData]);

  return (
    <UserBalanceContext.Provider value={{ tokenList }}>{children}</UserBalanceContext.Provider>
  );
}

export { UserBalanceProvider };
export default UserBalanceContext;
