import React, { useState, useEffect } from 'react';
import { useNetwork } from 'wagmi';

import { chainList } from '../config';
import NetworkSwitch from '../components/NetworkSwitch';
import TokenSelectorContainer from '../components/TokenSelector/TokenSelectorContainer';
import Panel from '../components/ui/Panel';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';

import useBridge from '../hooks/use-bridge';

function Transfer() {
  // depositData = {
  //   from: {
  //     _address: userAccount1.address,  - done
  //     chainId: chainId                 - done
  //   },
  //   to: {
  //     _address: userAccount1.address,  - done
  //     chainId: chainId                 - done
  //   },
  //   spender: bridge1.address,          - done
  //   token: token.address,              - done
  //   value: value,                      - done
  //   deadline: deadline,                - hardcore to 1h
  //   approveTokenTransferSig: {
  //     v: approveSignature.v,
  //     r: approveSignature.r,
  //     s: approveSignature.s
  //   }
  // };
  const [destinationChain, setDestinationChain] = useState();
  const [destinationChainsStatus, setDestinationChainsStatus] = useState(chainList);

  // Validation
  const [isTransferValid, setIsTransferValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const { chain } = useNetwork();
  const { tokenList, getTokenList } = useBridge();

  useEffect(() => {
    const destinationChainsNewStatus = chainList.map(chainEl => {
      if (chainEl.value === chain?.id) {
        return {...chainEl, disabled: true};
      }

      return chainEl;
    });
    const selectedDestinationChain = chainList.filter(chainEl => chainEl.value !== chain?.id);

    setDestinationChainsStatus(destinationChainsNewStatus);
    setDestinationChain(selectedDestinationChain[0]);
  }, [chain]);

  useEffect(() => {
    console.log('tokenList', tokenList);
  }, [tokenList]);

  return (
    <div className="transfer-form">
      <div className="shell-medium">
        <h1>Transfer</h1>

        <Panel>
          <div className="transfer-form__inner">
            <div className="transfer-form__container">
              <div className="d-flex align-items-center mb-4">
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
