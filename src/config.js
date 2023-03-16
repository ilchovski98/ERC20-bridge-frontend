export const chainList = [
  { label: 'Goerli', value: 5, blockExplorerUrl: 'https://goerli.etherscan.io' },
  { label: 'Sepolia', value: 11155111, blockExplorerUrl: 'https://sepolia.etherscan.io' },
];

export const chainsById = {
  5: { label: 'Goerli', blockExplorerUrl: 'https://goerli.etherscan.io' },
  11155111: { label: 'Sepolia', blockExplorerUrl: 'https://sepolia.etherscan.io' },
};

export const bridgeAddressesByChain = {
  11155111: '0xF55D12e0fe91c157c3D389F134a46b2182D2F6Da',
  5: '0xc551F21DE4cd2C55Ea1B8B9eb8b541aaBE9766EF',
};

export const originalTokensByChain = {
  11155111: [
    { name: 'RandomCoin', symbol: 'RC', address: '0x9a7F208A777ed19233380959c4028c99886c5843' },
    { name: 'DogeCoin', symbol: 'DC', address: '0x9b432836C67D4Bbe94a10EfB6Da0c9CEBA990a57' },
    { name: 'CatCoin', symbol: 'CC', address: '0x45D3F76AD684cDfeA4eCbc9842d595d3e68dd01E' },
  ],
  5: [
    { name: 'DinoCoin', symbol: 'DC', address: '0xBdb3eB1022F8Fa2d873aA0089C05a7A1b5004349' },
    { name: 'BridCoin', symbol: 'BC', address: '0x4A5b2aB0129A8F6b8b0CDd615B78B9D29DB10B11' },
  ],
};
