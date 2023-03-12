import React, { useState, useEffect } from 'react';
import { useNetwork } from 'wagmi';

import { chainList } from '../config';
import NetworkSwitch from '../components/NetworkSwitch';
import TokenSelectorContainer from '../components/TokenSelector/TokenSelectorContainer';
import Panel from '../components/ui/Panel';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';

function Transfer() {
  const [destinationChain, setDestinationChain] = useState();
  const [destinationChainsStatus, setDestinationChainsStatus] = useState(chainList);
  const [isTransferValid, setIsTransferValid] = useState(false);

  const { chain } = useNetwork();

  useEffect(() => {
    const destinationChainsNewStatus = chainList.map(chainEl => {
      if (chainEl.value === chain.id) {
        return {...chainEl, disabled: true};
      }

      return chainEl;
    });
    const selectedDestinationChain = chainList.filter(chainEl => chainEl.value !== chain.id);

    setDestinationChainsStatus(destinationChainsNewStatus);
    setDestinationChain(selectedDestinationChain[0]);
  }, [chain])

  return (
    <div className="transfer-form">
      <div className="shell-medium">
        <h1>Transfer</h1>

        <Panel>
          <div className="transfer-form__inner">
            <div className="transfer-form__container">
              <div className="d-flex align-items-center">
                <label>From</label>

                <NetworkSwitch />
              </div>

              <TokenSelectorContainer />
            </div>

            <div className="transfer-form__container">
              <div className="d-flex align-items-center">
                <label>To</label>

                <Dropdown
                  options={destinationChainsStatus}
                  value={destinationChain}
                  onChange={chain => setDestinationChain(chain)}
                />
              </div>
            </div>

            <div className="transfer-form__actions">
              <Button disabled={!isTransferValid}>Transfer</Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default Transfer;
