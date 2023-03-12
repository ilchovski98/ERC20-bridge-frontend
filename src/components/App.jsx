import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import Home from '../pages/Home';
import Transfer from '../pages/Transfer';
import Claim from '../pages/Claim';

import Header from './layout/Header';
import Footer from './layout/Footer';

function App() {
  const { provider } = configureChains([goerli], [publicProvider()]);

  const client = createClient({
    provider,
    autoConnect: true,
  });

  return (
    <BrowserRouter>
      <WagmiConfig client={client}>
        <div className="wrapper">
          <Header />

          <div className="main">
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/transfer" element={<Transfer />} />

              <Route path="/claim" element={<Claim />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </WagmiConfig>
    </BrowserRouter>
  );
}

export default App;
