export const getTransactions = async (targetChainId, userAddress) => {
  if (userAddress && targetChainId) {
    return await fetch(
      `http://localhost:8000/api/transactions/${userAddress}/${targetChainId}`,
    ).then(response => response.json());
  }
};
