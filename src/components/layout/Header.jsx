import React from 'react';
import { useConnect, useAccount, useBalance } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { goerli, sepolia } from 'wagmi/chains';
import { Link } from 'react-router-dom';

import { truncate } from '../../utils';

import Button from '../ui/Button';

const md5 = require('md5');

function Header() {
  const connector = new MetaMaskConnector({
    chains: [sepolia, goerli]
  });

  const { isConnected, address } = useAccount();
  const { connect, isLoading } = useConnect({
    connector,
  });

  const { data } = useBalance({
    address,
  });

  const handleConnectButtonClick = async () => {
    await connect();
  };

  return (
    <div className="header-wrapper">
      <div className="header">
        <div className="header__inner">
          <div className="header__content">
            <a href="/">
              <img
                src="https://limeacademy.tech/wp-content/uploads/2021/08/limeacademy_logo.svg"
                alt="Logo"
              />
            </a>

            <nav className="header__nav">
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>

                <li>
                  <Link to="/transfer">Transfer</Link>
                </li>

                <li>
                  <Link to="/claim">Claim</Link>
                </li>

                <li>
                  <Link to="/history">History</Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="header__utils">
            {isLoading ? (
              <span>Loading...</span>
            ) : isConnected ? (
              <>
                <div className="d-flex align-items-center justify-content-end">
                  <img
                    className="img-profile me-3"
                    src={`https://www.gravatar.com/avatar/${md5(address)}/?d=identicon`}
                    alt=""
                  />

                  <span>{truncate(address, 12)}</span>
                </div>
              </>
            ) : (
              <Button onClick={handleConnectButtonClick}>Connect Metamask</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
