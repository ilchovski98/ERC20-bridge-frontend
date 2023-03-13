import React, { useEffect, useState } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

import Dropdown from './ui/Dropdown';
import { chainList } from '../config';

const NetworkDropdown = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork(); // chains, error, isLoading, pendingChainId
  const [currentDropdownOption, setCurrentDropdownOption] = useState();

  useEffect(() => {
    const matchingChain = chainList.filter(chainEl => chainEl.value === chain?.id);
    setCurrentDropdownOption(matchingChain.length > 0 ? matchingChain[0] : chainList[0]);
  }, [chain]);

  return (
    <>
      <Dropdown
        options={chainList}
        value={currentDropdownOption}
        onChange={chainEl => switchNetwork(chainEl.value)}
      />
    </>
  );
};

export default NetworkDropdown;
