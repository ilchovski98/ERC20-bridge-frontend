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
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [contractError, setContractError] = useState('');
  const [transactionData, setTransactionData] = useState();

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
        chainId: destinationChain.value,
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
  const receive = async depositTransaction => {
    setIsContractLoading(true);

    try {
      const signature = await fetch(
        `http://localhost:8000/api/transactions/claim/${depositTransaction.id}`,
      ).then(response => response.json());

      const signatureSplit = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await contract.callStatic.claim(depositTransaction.claimData, signatureSplit);
      const claimTx = await contract.claim(depositTransaction.claimData, signatureSplit);
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

  return {
    contract,
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
