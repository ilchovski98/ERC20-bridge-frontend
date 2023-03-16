import { MultiCall } from '@limechain/multicall';
import { ethers } from 'ethers';

import permitERC20ABI from '../abi/PermitERC20.json';

export function truncate(str, n) {
  return str.length > n
    ? str.substr(0, n - 1) + '...' + str.substr(str.length - 4, str.length - 1)
    : str;
}

export function handleErrorMessage(error, setErrorMessage) {
  const errorName = error.errorName === 'Error' ? '' : error.errorName;
  const errorMessage = errorName
    ? `Execution reverted with error: ${error.errorName}!`
    : `Error: ${error.reason}`;
  setErrorMessage(errorMessage?.includes('user rejected transaction') ? '' : errorMessage);
}

export const multicallTokensDataByMethod = async (
  coinAddresses,
  methodName,
  methodArguments,
  signer,
) => {
  //Make a new class using signer/provider:
  const multi = new MultiCall(signer);
  // Array for the prepared encoded inputs
  const inputs = [];
  // Array for the decoded results with the balance of each token
  const outputs = [];

  // Here we use the direct name of the function to encode the params directly:
  for (let tokenAddress of coinAddresses) {
    inputs.push({ target: tokenAddress, function: methodName, args: methodArguments });
  }

  // We are calling then the multicall method passing the ABI of the contract as well as encoded inputs:
  const tokenData = await multi.multiCall(permitERC20ABI.abi, inputs);

  // We need to decode the result after the result is returned and we are using the first index of every element as follows:
  for (let i = 0; i < inputs.length; i++) {
    outputs[i] = tokenData[1][i];
  }

  return outputs;
};

/*
  Example usage:
  multicallTokenData('tokenAddress', ['methodName1', 'methodName2', 'methodName3'], [[methodArgs1], [methodArgs2], [methodArgs3]], signer/provider);
*/
export const multicallTokenData = async (coinAddress, methodNames, methodArguments, signer) => {
  //Make a new class using signer/provider:
  const multi = new MultiCall(signer);
  // Array for the prepared encoded inputs
  const inputs = [];
  // Array for the decoded results with the balance of each token
  const outputs = [];

  for (let i = 0; i < methodNames.length; i++) {
    inputs.push({ target: coinAddress, function: methodNames[i], args: methodArguments[i] });
  }

  // We are calling then the multicall method passing the ABI of the contract as well as encoded inputs:
  const tokenData = await multi.multiCall(permitERC20ABI.abi, inputs);
  // We need to decode the result after the result is returned and we are using the first index of every element as follows:
  for (let i = 0; i < inputs.length; i++) {
    outputs[i] = tokenData[1][i];
  }

  return outputs;
};

/*
  Example usage:
  multicallTokenData([tokenAddresses], ['methodName1', 'methodName2', 'methodName3'], [[methodArgs1], [methodArgs2], [methodArgs3]], signer/provider);
*/
export const multipleTokensMulticallData = async (
  coinAddresses,
  methodNames,
  methodArguments,
  signer,
) => {
  //Make a new class using signer/provider:
  const multi = new MultiCall(signer);
  // Array for the prepared encoded inputs
  const inputs = [];
  // Array for the decoded results with the balance of each token
  const outputs = [];

  for (let coinIndex = 0; coinIndex < coinAddresses.length; coinIndex++) {
    for (let methodIndex = 0; methodIndex < methodNames.length; methodIndex++) {
      inputs.push({
        target: coinAddresses[coinIndex],
        function: methodNames[methodIndex],
        args: methodArguments[methodIndex],
      });
    }
  }

  // We are calling then the multicall method passing the ABI of the contract as well as encoded inputs:
  const tokenData = await multi.multiCall(permitERC20ABI.abi, inputs);

  // We need to decode the result after the result is returned and we are using the first index of every element as follows:
  for (let i = 0; i < inputs.length; i++) {
    outputs[i] = tokenData[1][i];
  }

  return outputs;
};

export const multicallGetArrayElements = async (
  contractAddress,
  arrayLength,
  methodName,
  signer,
) => {
  //Make a new class using signer/provider:
  const multi = new MultiCall(signer);
  // Array for the prepared encoded inputs
  const inputs = [];
  // Array for the decoded results with the balance of each token
  const outputs = [];

  for (let i = 0; i < arrayLength.length; i++) {
    inputs.push({ target: contractAddress, function: methodName, args: [i] });
  }

  // We are calling then the multicall method passing the ABI of the contract as well as encoded inputs:
  const tokenData = await multi.multiCall(permitERC20ABI.abi, inputs);

  // We need to decode the result after the result is returned and we are using the first index of every element as follows:
  for (let i = 0; i < inputs.length; i++) {
    outputs[i] = tokenData[1][i];
  }

  return outputs;
};

export async function signPermitData(token, signer, owner, spender, value, deadline, chainId) {
  const nonce = await token.nonces(owner);
  const domain = {
    name: await token.name(),
    version: '1',
    chainId: chainId,
    verifyingContract: token.address,
  };

  const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ];

  const message = {
    owner: owner,
    spender: spender,
    value: value,
    nonce: nonce.toHexString(),
    deadline,
  };

  const signatureLike = await signer._signTypedData(domain, { Permit }, message);
  const signature = ethers.utils.splitSignature(signatureLike);

  return signature;
}

export async function signClaimData(bridge, signer, claimData, chainId) {
  const domain = {
    name: await bridge.name(),
    version: '1',
    chainId: chainId,
    verifyingContract: bridge.address,
  };

  const types = {
    User: [
      { name: '_address', type: 'address' },
      { name: 'chainId', type: 'uint256' },
    ],
    SourceTxData: [
      { name: 'transactionHash', type: 'bytes32' },
      { name: 'blockHash', type: 'bytes32' },
      { name: 'logIndex', type: 'uint256' },
    ],
    OriginalToken: [
      { name: 'tokenAddress', type: 'address' },
      { name: 'originChainId', type: 'uint256' },
    ],
    ClaimData: [
      { name: 'from', type: 'User' },
      { name: 'to', type: 'User' },
      { name: 'value', type: 'uint256' },
      { name: 'token', type: 'OriginalToken' },
      { name: 'depositTxSourceToken', type: 'address' },
      { name: 'targetTokenAddress', type: 'address' },
      { name: 'targetTokenName', type: 'string' },
      { name: 'targetTokenSymbol', type: 'string' },
      { name: 'deadline', type: 'uint256' },
      { name: 'sourceTxData', type: 'SourceTxData' },
    ],
    Claim: [
      { name: '_claimData', type: 'ClaimData' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const nonce = (await bridge.nonce(claimData.from._address)).toHexString();

  const value = {
    _claimData: claimData,
    nonce: nonce,
  };

  const signatureLike = await signer._signTypedData(domain, types, value);
  const signature = ethers.utils.splitSignature(signatureLike);

  return signature;
}

// claimData = {
//   from: {
//     _address: userAccount1.address,
//     chainId: chainId
//   },
//   to: {
//     _address: userAccount1.address,
//     chainId: chainId
//   },
//   value: 20,
//   token: {
//     tokenAddress: randomCoin.address,
//     originChainId: chainId
//   },
//   depositTxSourceToken: randomCoin.address,
//   targetTokenAddress: ethers.constants.AddressZero,
//   targetTokenName: "Wrapped " + (await randomCoin.name()),
//   targetTokenSymbol: "W" + (await randomCoin.symbol()),
//   deadline: ethers.constants.MaxUint256
// };
