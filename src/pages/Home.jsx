import React from 'react';
import { Link } from 'react-router-dom';

import Hero from '../components/Hero';

function Home() {
  return (
    <Hero
      title="This is ERC20 Token Bridge"
      description="You can use this bridge to transfer tokens between EVM based networks"
      className="section-hero--full-height"
    >
      <h2>Start Bridging</h2>

      <Link to="/transfer" className="btn btn-primary">Transfer</Link>
    </Hero>
  );
}

export default Home;
