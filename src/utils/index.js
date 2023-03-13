import { MultiCall } from '@limechain/multicall';

import permitERC20ABI from '../abi/PermitERC20.json';

export function truncate(str, n) {
  return str.length > n
    ? str.substr(0, n - 1) + '...' + str.substr(str.length - 4, str.length - 1)
    : str;
}

export function handleErrorMessage(error, setErrorMessage) {
  const errorMessage = error.errorName
    ? `Execution reverted with error: ${error.errorName}!`
    : error.reason;
  setErrorMessage(errorMessage?.includes('user rejected transaction') ? '' : errorMessage);
}

export const multicallTokenData = async (coinAddresses, methodName, methodArguments, signer) => {
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

// depositData = {
//   from: {
//     _address: userAccount1.address,
//     chainId: chainId
//   },
//   to: {
//     _address: userAccount1.address,
//     chainId: chainId
//   },
//   spender: bridge1.address,
//   token: maliciousCoin.address,
//   value: value,
//   deadline: deadline,
//   approveTokenTransferSig: {
//     v: approveSignature.v,
//     r: approveSignature.r,
//     s: approveSignature.s
//   }
// };

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
