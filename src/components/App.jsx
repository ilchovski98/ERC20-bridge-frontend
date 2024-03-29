import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { sepolia, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';

import { UserBalanceProvider } from '../context/userBalances';
import { BackendAvailabilityProvider } from '../context/backendAvailability';
import Home from '../pages/Home';
import Transfer from '../pages/Transfer';
import Claim from '../pages/Claim';
import History from '../pages/History';
import Header from './layout/Header';
import Footer from './layout/Footer';

function App() {
  const { provider } = configureChains(
    [goerli, sepolia],
    [
      infuraProvider({ apiKey: process.env.REACT_APP_INFURA_API_KEY || '' }),
      publicProvider()
    ],
  );

  const client = createClient({
    provider,
    autoConnect: true,
  });

  return (
    <BrowserRouter>
      <WagmiConfig client={client}>
        <UserBalanceProvider>
          <BackendAvailabilityProvider>
            <div className="wrapper">
              <Header />

              <div className="main">
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route path="/transfer" element={<Transfer />} />

                  <Route path="/claim" element={<Claim />} />

                  <Route path="/history" element={<History />} />
                </Routes>
              </div>

              <Footer />
            </div>
          </BackendAvailabilityProvider>
        </UserBalanceProvider>
      </WagmiConfig>
    </BrowserRouter>
  );
}

export default App;
