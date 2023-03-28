import React from 'react';

import { useConnect } from 'wagmi';
import { goerli, sepolia } from 'wagmi/chains';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

import Button from '../ui/Button';

const Connect = ({ className }) => {
  const connector = new MetaMaskConnector({
    chains: [sepolia, goerli]
  });

  const { connect } = useConnect({
    connector,
  });

  const handleConnectButtonClick = async () => {
    await connect();
  };

  return (
    <div className={`section-hero ${className}`}>
      <div className="shell">
        <div className="section-hero__content">
          <Button onClick={handleConnectButtonClick}>Connect Metamask</Button>
        </div>
      </div>
    </div>
  );
};

export default Connect;
