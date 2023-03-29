import { createContext, useState, useEffect, useCallback } from 'react';
import { useSigner, useNetwork } from 'wagmi';
import { ethers } from 'ethers';

import permitERC20ABI from '../abi/PermitERC20.json';

import useBridge from '../hooks/use-bridge';
import { multicallTokensDataByMethod, multicallGetArrayElements } from '../utils';
import { originalTokensByChain } from '../config';

const UserBalanceContext = createContext();

function UserBalanceProvider({ children }) {
  const [tokenList, setTokenList] = useState([]);
  const [allTokenAddresses, setAllTokenAddresses] = useState();
  const [tokenBalances, setTokenBalances] = useState();

  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const { contract } = useBridge();

  const updateTokenBalances = useCallback(async () => {
    if (!signer) return;
    if (allTokenAddresses?.length > 0) {
      const userBalances = await multicallTokensDataByMethod(
        allTokenAddresses,
        'balanceOf',
        [signer._address],
        signer,
      );

      let newBalances = {};

      allTokenAddresses.forEach((token, index) => {
        newBalances = {
          ...newBalances,
          [token]: userBalances[index],
        };
      });

      setTokenBalances(newBalances);
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

      let newBalances = {};

      const tokenListData = finalTokenList.map((token, index) => {
        newBalances = {
          ...newBalances,
          [token]: userBalances[index],
        };

        return {
          name: names[index],
          symbol: symbols[index],
          address: token,
        };
      });

      setTokenBalances(newBalances);
      setAllTokenAddresses(finalTokenList);
      setTokenList(tokenListData);
    }
  }, [chain, contract, signer]);

  const getTokenBalance = useCallback(
    async address => {
      if (!address) return;
      if (tokenBalances[address]) {
        return tokenBalances[address];
      }

      if (signer) {
        const tokenContract = new ethers.Contract(address, permitERC20ABI.abi, signer);
        const value = await tokenContract.balanceOf(signer._address).catch(error => false);

        if (value) {
          return ethers.utils.formatEther(value);
        }
      }

      return;
    },
    [tokenBalances, signer],
  );

  useEffect(() => {
    console.log('network change!');
    handleNetworkChange();
  }, [handleNetworkChange]);

  useEffect(() => {
    const provider = signer?.provider;
    if (signer) {
      updateTokenBalances();
      provider.on('block', async () => {
        console.log('new block');
        updateTokenBalances();
      });
    }

    return () => provider?.off('block');
  }, [signer, updateTokenBalances, chain]);

  return (
    <UserBalanceContext.Provider value={{ tokenList, getTokenBalance }}>
      {children}
    </UserBalanceContext.Provider>
  );
}

export { UserBalanceProvider };
export default UserBalanceContext;
