import React, { useState, useEffect, useContext } from 'react';
import { Grid, Button, TextField, Typography, InputBase } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ArrowDownward } from '@material-ui/icons';
import validate from 'bitcoin-address-validation';

import { StoreContext } from 'mobx/store-context';
import { MIN_AMOUNT } from './constants';
import { Slippage, ValuesProp } from './Common';

const BTCLogo = '/assets/icons/btc.svg';

interface ReleaseFormProps {
  values: ValuesProp;
  handleChange(name: string): (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSetMaxSlippage: (name: string) => () => void;
  previousStep: () => void;
  nextStep: () => void;
  classes: ClassNameMap;
  updateState: (name: string, value: unknown) => void;
  assetSelect: () => JSX.Element;
  connectWallet: () => Promise<void>;
  calcFees: (inputAmount: number, name: string) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const ReleaseForm = ({
  classes,
  handleChange,
  handleSetMaxSlippage,
  nextStep,
  values,
  connectWallet,
  updateState,
  assetSelect,
  calcFees,
}: ReleaseFormProps): JSX.Element => {
  const store = useContext(StoreContext);
  const {
    onboard,
    bridge: { renbtcBalance, wbtcBalance, byvwbtcBalance, bCRVrenBTCBalance, bCRVsBTCBalance, bCRVtBTCBalance },
  } = store;

  const [validAddress, setValidAddress] = useState(false);
  const next = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    nextStep();
  };

  const setAmount = (amount: number, token: string) => (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    updateState('token', token);
    calcFees(amount, 'burnAmount');
  };

  const selectedTokenBalance = () => {
    switch (values.token) {
      case 'renBTC':
        return renbtcBalance;
      case 'WBTC':
        return wbtcBalance;
      case 'byvWBTC':
        return byvwbtcBalance;
      case 'bCRVrenBTC':
        return bCRVrenBTCBalance;
      case 'bCRVsBTC':
        return bCRVsBTCBalance;
      case 'bCRVtBTC':
        return bCRVtBTCBalance;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (validate(values.btcAddr)) {
      setValidAddress(true);
    } else {
      setValidAddress(false);
    }
  }, [values.btcAddr]);

  const isWBTC = values.token === 'WBTC' || values.token === 'byvWBTC';

  return (
    <>
      <Grid container spacing={2} style={{ padding: '.6rem 2rem' }}>
        <Grid item xs={12} style={{ marginBottom: '.2rem' }}>
          <Typography variant="body1" color="textSecondary" style={{ textAlign: 'right' }}>
            Balance: {selectedTokenBalance()}
          </Typography>
        </Grid>

        <Grid item container xs={12} className={classes.focusableBorderedContainer}>
          <Grid item xs={12} sm={5}>
            <InputBase
              value={values.burnAmount}
              disabled={onboard.isActive() === false}
              placeholder="0.00"
              onChange={handleChange('burnAmount')}
              style={{
                fontSize: '3rem',
                color: selectedTokenBalance() < parseFloat(values.burnAmount) ? 'red' : 'inherit',
                paddingLeft: 8,
                paddingBottom: 8,
              }}
            />
          </Grid>
          <Grid item container spacing={1} xs={12} sm={7} className={classes.releaseInputContainer}>
            <Grid item>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  setAmount(selectedTokenBalance(), values.token)(e);
                }}
              >
                max
              </Button>
            </Grid>
            <Grid item>{assetSelect()}</Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <ArrowDownward />
        </Grid>

        <Grid item xs={12}>
          <TextField
            variant="outlined"
            size="medium"
            value={values.btcAddr}
            disabled={onboard.isActive() === false}
            fullWidth={true}
            error={!validAddress}
            placeholder="Your BTC address"
            onChange={handleChange('btcAddr')}
          />
        </Grid>

        {isWBTC && (
          <Slippage
            values={values}
            classes={classes}
            handleChange={handleChange}
            handleSetMaxSlippage={handleSetMaxSlippage}
            disabled={onboard.isActive() === false}
          />
        )}
      </Grid>

      <Grid container spacing={2} style={{ padding: '1rem 0 0' }}>
        <Grid item xs={12} className={classes.summaryWrapper}>
          <div className={classes.summaryRow}>
            <Typography variant="subtitle1">You will receive: </Typography>
            <Typography variant="body1">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={BTCLogo} className={classes.logo2} />
                {values.receiveAmount.toFixed(8)} BTC
              </div>
            </Typography>
          </div>

          {isWBTC && (
            <div className={classes.summaryRow}>
              <Typography variant="subtitle1">Price impact: </Typography>
              <Typography variant="body1">{Math.abs(values.estimatedSlippage * 100).toFixed(2) + '%'}</Typography>
            </div>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems={'center'} style={{ padding: '.6rem 2rem' }}>
        <Grid item xs={12}>
          {onboard.isActive() ? (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className={classes.button}
              size="large"
              onClick={next}
              disabled={
                parseFloat(values.burnAmount) > MIN_AMOUNT &&
                selectedTokenBalance() >= parseFloat(values.burnAmount) &&
                validAddress
                  ? false
                  : true
              }
            >
              Next
            </Button>
          ) : (
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={connectWallet}
            >
              Connect
            </Button>
          )}
        </Grid>
      </Grid>
    </>
  );
};
