import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';

import Field from './ui/Field';
import Button from './ui/Button';
import Panel from './ui/Panel';
import TokenItem from './TokenItem';

import { multicallTokenData } from '../utils';

const TokenSearch = ({ handleTokenConfirm, handleTokenCancel }) => {
  const { data: signer } = useSigner();

  const [showResult, setShowResult] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenData, setTokenData] = useState();
  const [isLoadingCheck, setIsLoadingCheck] = useState(false);

  const validateTokenAddress = async (tokenAddress) => {
    if (!ethers.utils.isAddress(tokenAddress)) {
      setErrorMessage("This is not a valid address!");
    } else {
      setErrorMessage("");
    }
  }

  const handleTokenAddressCheck = async () => {
    setIsLoadingCheck(true);

    await validateTokenAddress(tokenAddress);
    const data = await multicallTokenData(tokenAddress, ['name', 'symbol', 'balanceOf'], [[], [], [signer._address]], signer);

    let allValuesAreNotNull = true;

    data.forEach(element => {
      if (element === null) {
        allValuesAreNotNull = false;
      }
    });

    if (allValuesAreNotNull) {
      setTokenData({
        name: data[0],
        symbol: data[1],
        balance: data[2]
      });
    } else {
      setErrorMessage("The provided address do not implement the ERC20 standard");
    }

    setIsLoadingCheck(false);
  }

  useEffect(() => {
    if (tokenData || errorMessage) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }, [errorMessage, tokenData]);

  return (
    <div className="token-search">
      <div className="token-search__head">
        <Field
          value={tokenAddress}
          onChange={event => setTokenAddress(event.target.value)}
          placeholder="Use token by address"
          className="token-search__field"
        />

        <Button
          onClick={handleTokenAddressCheck}
          className="token-search__btn"
          loading={isLoadingCheck}
          loadingText="Loading"
        >Check</Button>
      </div>

      {
        showResult &&
        <div className="token-search__body">
          {errorMessage && <div className="alert alert-danger mt-4">{errorMessage}</div>}

          {
            !errorMessage &&
            <div className="token-search__token-confirmation">
              <Panel className="panel--border panel--padding-none">
                <span className="token-search__message">Please confirm that this is your desired token:</span>

                <TokenItem token={tokenData} className="token-item--no-click" />

                <div className="token-search__actions">
                  <Button onClick={() => handleTokenConfirm(tokenData)}>Confirm</Button>

                  <Button onClick={handleTokenCancel}>Cancel</Button>
                </div>
              </Panel>
            </div>
          }
        </div>
      }
    </div>
  );
};

export default TokenSearch;
