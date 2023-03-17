import { ethers } from 'ethers';

import { bridgeAddressesByChain } from '../config';
import bridgeABI from '../abi/Bridge.json';
import { multipleTokensMulticallData } from '../utils';

const GOERLI_RPC_URL = process.env.REACT_APP_GOERLI_RPC_URL || '';
const SEPOLIA_RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL || '';
const BRIDGE_OWNER_PRIVATE_KEY = process.env.REACT_APP_BRIDGE_OWNER_PRIVATE_KEY || '';

// Goerli
const goerliProvider = new ethers.providers.JsonRpcProvider(GOERLI_RPC_URL, 'any');
const goerliBridgeOwnerSigner = new ethers.Wallet(BRIDGE_OWNER_PRIVATE_KEY, goerliProvider);
const goerliBridgeContract = new ethers.Contract(
  bridgeAddressesByChain[5],
  bridgeABI.abi,
  goerliBridgeOwnerSigner,
);

// Sepolia
const sepoliaProvider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL, 'any');
const sepoliaBridgeOwnerSigner = new ethers.Wallet(BRIDGE_OWNER_PRIVATE_KEY, sepoliaProvider);
const sepoliaBridgeContract = new ethers.Contract(
  bridgeAddressesByChain[11155111],
  bridgeABI.abi,
  sepoliaBridgeOwnerSigner,
);

/*
  This function replaces the functionality of a database.
*/
export const getAllEventsFromAllBridgeChains = async () => {
  const goerliEvents = await goerliBridgeContract.queryFilter('*', 8648602);
  const sepoliaEvents = await sepoliaBridgeContract.queryFilter('*', 3082523);

  return {
    5: goerliEvents,
    11155111: sepoliaEvents,
  };
};

/*
  Gets the deposit transactions towards the user to the target chain
  and gets all claims made on the target chain
*/
export const getUserTransactions = async (targetChainId, userAddress) => {
  if (!targetChainId) {
    console.log('getUserTransactions(): Provide targetChainId!');
    return false;
  }

  if (!userAddress) {
    console.log('getUserTransactions(): Provide userAddress!');
    return false;
  }

  const bridgesEventsData = await getAllEventsFromAllBridgeChains();

  const depositTxsTowardsUserOnTargetChain = [];
  const claimTxsUserExecutedOnTargetChain = [];

  // Gathers all unique token addresses by chainId
  const tokensToFetch = {
    5: [],
    11155111: [],
  };

  const storeTokenToFetch = (address, chainId) => {
    if (address) {
      if (!tokensToFetch[chainId]?.includes(address)) {
        tokensToFetch[chainId].push(address);
      }
    }
  };

  /*
    Loop trough all events from all chains,
    leave only current user related events and
    group them by deposit/claim related
  */
  Object.keys(bridgesEventsData).forEach(chainId => {
    if (targetChainId.toString() === chainId.toString()) {
      // Claim transacitons
      bridgesEventsData[chainId].forEach(eventData => {
        const eventArgs = eventData.args;

        if (eventData.event === 'ReleaseOriginalToken' || eventData.event === 'MintWrappedToken') {
          if (
            eventArgs.recepient === userAddress &&
            eventArgs.toChainId.toString() === targetChainId.toString()
          ) {
            claimTxsUserExecutedOnTargetChain.push(eventData);
          }
        }
      });
    } else {
      // Deposit transacitons
      bridgesEventsData[chainId].forEach(eventData => {
        if (eventData.event === 'LockOriginalToken' || eventData.event === 'BurnWrappedToken') {
          const eventArgs = eventData.args;
          if (
            eventArgs.recepient === userAddress &&
            eventArgs.toChainId.toString() === targetChainId.toString()
          ) {
            depositTxsTowardsUserOnTargetChain.push(eventData);

            eventArgs.lockedTokenAddress &&
              storeTokenToFetch(eventArgs.lockedTokenAddress, eventArgs.sourceChainId);

            eventArgs.originalTokenAddress &&
              storeTokenToFetch(eventArgs.originalTokenAddress, eventArgs.originalTokenChainId);

            eventArgs.burnedWrappedTokenAddress &&
              storeTokenToFetch(eventArgs.burnedWrappedTokenAddress, eventArgs.sourceChainId);
          }
        }
      });
    }
  });

  const result = {
    depositsFromChains: depositTxsTowardsUserOnTargetChain,
    claimsOnCurrentChain: claimTxsUserExecutedOnTargetChain,
    tokensToFetch,
  };

  return result;
};

/*
  Checks each deposit transaction if it is already claimed
*/
export const getClaimData = async (targetChainId, userAddress) => {
  if (!targetChainId) {
    console.log('getClaimData(): targetChainId is not defined');
    return false;
  }

  if (!userAddress) {
    console.log('getClaimData(): userAddress is not defined');
    return false;
  }

  const rawClaimData = await getUserTransactions(targetChainId, userAddress);
  const tokenDataByChain = await getTokenNamesAndSymbols(rawClaimData.tokensToFetch);
  // Claim event unique identifiers - with this data we can pair the deposit txs with the claim txs
  const allClaimEventIdentifiers = [];
  rawClaimData.claimsOnCurrentChain.forEach(transaction => {
    allClaimEventIdentifiers.push(
      `${transaction.args.transactionHash}-${transaction.args.blockHash}-${transaction.args.logIndex}`,
    );
  });

  // label transactions towards user target chain as claimed/not claimed
  const claimData = rawClaimData.depositsFromChains.map(transaction => {
    const isClaimed = allClaimEventIdentifiers.includes(
      `${transaction.transactionHash}-${transaction.blockHash}-${transaction.logIndex}`,
    );
    return { transaction: transaction, claimed: isClaimed };
  });

  return { claimData, tokenDataByChain };
};

const getTokenNamesAndSymbols = async tokensByChain => {
  const tokenNamesAndSymbolsByChain = {};
  const chains = Object.keys(tokensByChain);
  const signers = {
    11155111: sepoliaBridgeOwnerSigner,
    5: goerliBridgeOwnerSigner,
  };

  for (let index = 0; index < chains.length; index++) {
    const currentChainId = chains[index];
    const addresses = tokensByChain[currentChainId];

    if (addresses.length > 0) {
      const multicalResult = await multipleTokensMulticallData(
        addresses,
        ['name', 'symbol'],
        [[], []],
        signers[currentChainId],
      );

      tokenNamesAndSymbolsByChain[currentChainId] = {};

      addresses.forEach((address, index) => {
        const dataIndex = index * 2;
        tokenNamesAndSymbolsByChain[currentChainId][address] = {
          name: multicalResult[dataIndex],
          symbol: multicalResult[dataIndex + 1],
        };
      });
    }
  }

  return tokenNamesAndSymbolsByChain;
};
