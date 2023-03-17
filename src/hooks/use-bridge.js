import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner, useNetwork } from 'wagmi';

import bridgeABI from '../abi/Bridge.json';
import PermitERC20 from '../abi/PermitERC20.json';
import { bridgeAddressesByChain, originalTokensByChain } from '../config';
import {
  multicallTokensDataByMethod,
  multicallGetArrayElements,
  signPermitData,
  signClaimData,
  handleErrorMessage,
} from '../utils';

const useBridge = () => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const [contract, setContract] = useState();
  const [tokenList, setTokenList] = useState([]);
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [contractError, setContractError] = useState('');
  const [transactionData, setTransactionData] = useState();

  // Gets the balance, name and symbols of hardcoded tokens and known wrapped tokens
  const getTokenList = useCallback(async () => {
    setIsContractLoading(true);

    const originalTokenList = originalTokensByChain[chain?.id]?.map(coin => coin.address);
    const numberOfWrappedTokens = (await contract.getNumberOfWrappedTokens())?.toNumber();

    const wrappedTokenList = await multicallGetArrayElements(
      contract.address,
      numberOfWrappedTokens,
      'wrappedTokens',
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
      setIsContractLoading(false);
    }
  }, [contract, signer, chain]);

  const resetError = () => {
    setContractError('');
  };

  const resetTransactionData = () => {
    setTransactionData('');
  };

  // Deposit function + deciding logic to use permits or not
  const transfer = async (token, amount, destinationChain) => {
    setIsContractLoading(true);

    const tokenContract = new ethers.Contract(token.address, PermitERC20.abi, signer);
    const deadline = Date.now() + 60 * 60;
    let tokenImplementsPermits = true;

    try {
      await tokenContract.estimateGas.permit(
        signer._address,
        contract.address,
        amount,
        deadline,
        27,
        ethers.constants.HashZero,
        ethers.constants.HashZero,
      );
    } catch (error) {
      if (error.message.includes('is not a function')) {
        tokenImplementsPermits = false;
      }
    }

    let depositData = {
      from: {
        _address: signer._address,
        chainId: chain.id,
      },
      to: {
        _address: signer._address,
        chainId: destinationChain.value, // Todo fix this .value get direct value
      },
      spender: contract.address,
      token: token.address,
      value: amount,
      deadline: deadline,
      approveTokenTransferSig: {
        v: 0,
        r: ethers.constants.HashZero,
        s: ethers.constants.HashZero,
      },
    };

    if (tokenImplementsPermits) {
      const permitSignature = await signPermitData(
        tokenContract,
        signer,
        signer._address,
        contract.address,
        amount,
        deadline,
        chain.id,
      );

      depositData = {
        ...depositData,
        approveTokenTransferSig: {
          v: permitSignature.v,
          r: permitSignature.r,
          s: permitSignature.s,
        },
      };

      try {
        await contract.callStatic.depositWithPermit(depositData);
        const depositTx = await contract.depositWithPermit(depositData);
        const transaction = await depositTx.wait();
        setTransactionData(transaction);
        resetError('');
      } catch (error) {
        handleErrorMessage(error, setContractError);
      }
    } else {
      try {
        await tokenContract.callStatic.approve(contract.address, amount);
        const approveTx = await tokenContract.approve(contract.address, amount);
        await approveTx.wait();

        await contract.callStatic.deposit(depositData);
        const depositTx = await contract.deposit(depositData);
        const transaction = await depositTx.wait();
        setTransactionData(transaction);
        resetError('');
      } catch (error) {
        handleErrorMessage(error, setContractError);
      }
    }

    setIsContractLoading(false);
  };

  // Claim data generation, signing and sending
  const receive = async (depositTransaction, tokensDataByChain) => {
    setIsContractLoading(true);

    let claimData;
    const depositTx = depositTransaction;
    const transactionArgs = depositTx.args;

    if (depositTx.event === 'LockOriginalToken') {
      const token =
        tokensDataByChain[transactionArgs.sourceChainId][transactionArgs.lockedTokenAddress];
      const tokenName = token.name;
      const tokenSymbol = token.symbol;

      claimData = {
        from: {
          _address: transactionArgs.sender,
          chainId: transactionArgs.sourceChainId,
        },
        to: {
          _address: transactionArgs.recepient,
          chainId: transactionArgs.toChainId,
        },
        value: transactionArgs.value,
        token: {
          tokenAddress: transactionArgs.lockedTokenAddress,
          originChainId: transactionArgs.sourceChainId,
        },
        depositTxSourceToken: transactionArgs.lockedTokenAddress,
        targetTokenAddress: ethers.constants.AddressZero,
        targetTokenName: 'Wrapped ' + tokenName,
        targetTokenSymbol: 'W' + tokenSymbol,
        deadline: ethers.constants.MaxUint256,
        sourceTxData: {
          transactionHash: depositTx.transactionHash,
          blockHash: depositTx.blockHash,
          logIndex: depositTx.logIndex,
        },
      };
    } else if (depositTx.event === 'BurnWrappedToken') {
      let targetTokenAddress, token;

      if (transactionArgs.originalTokenChainId === transactionArgs.toChainId) {
        // Claiming original token
        targetTokenAddress = ethers.constants.AddressZero;
        token =
          tokensDataByChain[transactionArgs.originalTokenChainId][
            transactionArgs.originalTokenAddress
          ];
      } else {
        // Claiming wrapped token
        targetTokenAddress = transactionArgs.originalTokenAddress;
        token =
          tokensDataByChain[transactionArgs.sourceChainId][
            transactionArgs.burnedWrappedTokenAddress
          ];
      }

      claimData = {
        from: {
          _address: transactionArgs.sender,
          chainId: transactionArgs.sourceChainId,
        },
        to: {
          _address: transactionArgs.recepient,
          chainId: transactionArgs.toChainId,
        },
        value: transactionArgs.value,
        token: {
          tokenAddress: transactionArgs.originalTokenAddress,
          originChainId: transactionArgs.originalTokenChainId,
        },
        depositTxSourceToken: transactionArgs.burnedWrappedTokenAddress,
        targetTokenAddress: targetTokenAddress,
        targetTokenName: token.name,
        targetTokenSymbol: token.symbol,
        deadline: ethers.constants.MaxUint256,
        sourceTxData: {
          transactionHash: depositTx.transactionHash,
          blockHash: depositTx.blockHash,
          logIndex: depositTx.logIndex,
        },
      };
    }

    // sign data
    const signature = await signClaimData(contract, signer, claimData, chain.id.toString());
    const signatureSplit = { v: signature.v, r: signature.r, s: signature.s };

    try {
      await contract.callStatic.claim(claimData, signatureSplit);
      const claimTx = await contract.claim(claimData, signatureSplit);
      const transaction = await claimTx.wait();

      setTransactionData(transaction);
      resetError('');
    } catch (error) {
      console.log(error);
      handleErrorMessage(error, setContractError);
    }

    setIsContractLoading(false);
  };

  const deposit = async data => {
    await contract.callStatic.deposit(data);
    const depositTx = await contract.claim(data);
    await depositTx.wait();
  };

  const depositWithPermit = async data => {
    await contract.callStatic.depositWithPermit(data);
    const depositTx = await contract.claim(data);
    await depositTx.wait();
  };

  const claim = async (data, signature) => {
    await contract.callStatic.claim(data, signature);
    const claimTx = await contract.claim(data, signature);
    await claimTx.wait();
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
    isContractLoading,
    contractError,
    resetError,
    transactionData,
    resetTransactionData,
    transfer,
    receive,
    claim,
    deposit,
    depositWithPermit,
  };
};

export default useBridge;
