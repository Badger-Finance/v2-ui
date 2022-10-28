import { TransactionStatus } from '@badger-dao/sdk';
import { Button, debounce, Grid, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BigNumber } from 'ethers';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Id, toast } from 'react-toastify';
import { useNumericInput } from 'utils/useNumericInput';

import TxCompletedToast, { TX_COMPLETED_TOAST_DURATION } from '../../components-v2/TransactionToast';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import {
  showTransferRejectedToast,
  showTransferSignedToast,
  showWalletPromptToast,
  updateWalletPromptToast,
} from '../../utils/toasts';
import {
  BalanceGrid,
  BorderedFocusableContainerGrid,
  EndAlignText,
  ErrorText,
  InputTokenActionButtonsGrid,
  InputTokenAmount,
  OutputAmountText,
  OutputContentGrid,
  OutputTokenGrid,
  SummaryGrid,
} from './Common';
import { DownArrow } from './DownArrow';
import { OptionToken } from './OptionToken';
import { OptionTokens } from './OptionTokens';

type RedeemInformation = {
  inputAmount: TokenBalance;
  redeemAmount: TokenBalance;
  max: TokenBalance;
  fee: TokenBalance;
  conversionRate: TokenBalance;
};

const useStyles = makeStyles((theme) => ({
  outputContent: {
    marginTop: theme.spacing(4),
  },
  maxAmount: {
    cursor: 'pointer',
  },
}));

interface ButtonProps {
  children: React.ReactNode;
}

const ActionButton = observer(({ children }: ButtonProps): JSX.Element => {
  return <>{children}</>;
});

export const Redeem = observer((): JSX.Element => {
  const store = useContext(StoreContext);
  const classes = useStyles();

  const {
    ibBTCStore: { redeemOptions, ibBTC, redeemFeePercent, redeemRates, initialized },
    transactions,
    wallet,
    sdk,
    user,
  } = store;

  const [selectedToken, setSelectedToken] = useState<TokenBalance>();
  const [inputAmount, setInputAmount] = useState('');
  const [redeemBalance, setRedeemBalance] = useState<TokenBalance>();
  const [outputAmount, setOutputAmount] = useState<string>();
  const [conversionRate, setConversionRate] = useState<string>();
  const [maxRedeem, setMaxRedeem] = useState<BigNumber>();
  const [totalRedeem, setTotalRedeem] = useState('0.000');
  const [fee, setFee] = useState('0.000');
  const [isEnoughToRedeem, setIsEnoughToRedeem] = useState(true);
  const { onValidChange, inputProps } = useNumericInput();

  const redeemBalanceRedeemRate = selectedToken ? redeemRates[selectedToken.token.address] : undefined;

  const resetState = () => {
    setInputAmount('');
    setOutputAmount(undefined);
    setMaxRedeem(undefined);
    setIsEnoughToRedeem(true);
    setFee('0.000');
    setTotalRedeem('0.000');
  };

  const setRedeemInformation = ({ inputAmount, redeemAmount, max, fee, conversionRate }: RedeemInformation): void => {
    setIsEnoughToRedeem(max.tokenBalance.gte(inputAmount.tokenBalance));
    setOutputAmount(redeemAmount.balanceDisplay(6));
    setFee(fee.balanceDisplay(6));
    setTotalRedeem(redeemAmount.balanceDisplay(6));
    setConversionRate(conversionRate.balanceDisplay(6));
  };

  const calculateRedeem = async (ibbtcBalance: TokenBalance, outTokenBalance: TokenBalance): Promise<void> => {
    const [{ sett, fee, max }, conversionRate] = await Promise.all([
      sdk.ibbtc.estimateRedeem(ibbtcBalance.tokenBalance),
      store.ibBTCStore.getRedeemConversionRate(),
    ]);

    setMaxRedeem(max);
    setRedeemInformation({
      inputAmount: ibbtcBalance,
      redeemAmount: TokenBalance.fromBigNumber(outTokenBalance, sett),
      max: TokenBalance.fromBigNumber(ibBTC, max),
      fee: TokenBalance.fromBigNumber(ibBTC, fee),
      conversionRate: TokenBalance.fromBalance(outTokenBalance, conversionRate),
    });
  };

  const handleInputChange = (change: string) => {
    setInputAmount(change);
    setRedeemBalance(TokenBalance.fromBalance(ibBTC, Number(change)));
    debounceInputAmountChange(change);
  };

  const debounceInputAmountChange = useCallback(
    debounce(async (change: string): Promise<void> => {
      if (!selectedToken) {
        return;
      }

      if (!(Number(change) > 0)) {
        setOutputAmount(undefined);
        setMaxRedeem(undefined);
        setIsEnoughToRedeem(true);
        setFee('0.000');
        setTotalRedeem('0.000');
        return;
      }

      await calculateRedeem(TokenBalance.fromBalance(ibBTC, Number(change)), selectedToken);
    }, 200),
    [selectedToken],
  );

  const handleApplyMaxBalance = async (): Promise<void> => {
    if (!selectedToken) {
      return;
    }

    setInputAmount(ibBTC.balanceDisplay(6));
    setRedeemBalance(ibBTC);
    await calculateRedeem(ibBTC, selectedToken);
  };

  const handleLimitClick = async (limit: BigNumber): Promise<void> => {
    if (!selectedToken) {
      return;
    }

    const limitBalance = TokenBalance.fromBigNumber(ibBTC, limit);
    setInputAmount(limitBalance.balanceDisplay(6));
    setRedeemBalance(limitBalance);
    await calculateRedeem(limitBalance, selectedToken);
  };

  const handleTokenChange = async (tokenBalance: TokenBalance): Promise<void> => {
    setSelectedToken(tokenBalance);
    if (inputAmount) {
      await calculateRedeem(TokenBalance.fromBalance(ibBTC, Number(inputAmount)), tokenBalance);
    }
  };

  const handleRedeemClick = async (): Promise<void> => {
    if (redeemBalance && selectedToken) {
      const isValidAmount = store.ibBTCStore.isValidAmount(redeemBalance, ibBTC);

      if (!isValidAmount) {
        return;
      }

      const {
        tokenBalance,
        token: { address },
      } = redeemBalance;

      const redeemAmount = `${+Number(inputAmount).toFixed(2)} ibBTC`;
      const redeemedAmount = `${redeemBalance.balanceDisplay(2)} ${redeemBalance.token.symbol}`;

      let toastId: Id = `redeem-${address}`;

      const result = await sdk.ibbtc.redeem({
        amount: tokenBalance,
        token: address,
        onApprovePrompt: () => {
          toastId = showWalletPromptToast('Confirm approval of tokens for redeeming');
        },
        onApproveSigned: () => {
          updateWalletPromptToast(toastId, 'Submitted approval of tokens for redeeming');
        },
        onApproveSuccess: () => toast.success('Completed approval of tokens for redeeming'),
        onTransferPrompt: () => {
          toastId = showWalletPromptToast(`Confirm redeem of ${redeemAmount}`);
        },
        onTransferSigned: ({ transaction }) => {
          if (transaction) {
            transactions.addSignedTransaction({
              hash: transaction.hash,
              addedTime: Date.now(),
              name: `Redeem ${redeemAmount}`,
              description: redeemedAmount,
            });
            showTransferSignedToast(
              toastId,
              <TxCompletedToast title={`Submitted redeem for ${redeemedAmount}`} hash={transaction.hash} />,
            );
          }
        },
        onTransferSuccess: ({ receipt }) => {
          if (receipt) {
            transactions.updateCompletedTransaction(receipt);
            toast(<TxCompletedToast title={`Redeem to ${redeemedAmount}`} hash={receipt.transactionHash} />, {
              type: receipt.status === 0 ? 'error' : 'success',
              autoClose: TX_COMPLETED_TOAST_DURATION,
            });
          }
        },
        onError: (err) => toast.error(`Failed ibBTC redeem, error: ${err}`),
        onRejection: () => showTransferRejectedToast(toastId, 'Redeem transaction canceled by user'),
      });

      if (result === TransactionStatus.Success) {
        resetState();
        await user.reloadBalances();
      }
    }
  };

  useEffect(() => {
    const defaultBalance = redeemOptions[0];

    // reload balance to load symbol that's loaded async
    if (!selectedToken && defaultBalance.token.symbol) {
      setSelectedToken(defaultBalance);
    }
  }, [redeemOptions, selectedToken]);

  return (
    <>
      <Grid container>
        <BalanceGrid item xs={12}>
          <EndAlignText variant="body1" color="textSecondary">
            Balance: {ibBTC.balanceDisplay(6)}
          </EndAlignText>
        </BalanceGrid>
        <BorderedFocusableContainerGrid item container xs={12}>
          <Grid item xs={8} sm={7}>
            <InputTokenAmount
              inputProps={inputProps}
              value={inputAmount}
              disabled={!wallet.isConnected}
              placeholder="0.000"
              onChange={onValidChange(handleInputChange)}
            />
          </Grid>
          <InputTokenActionButtonsGrid item container spacing={1} xs={4} sm={5}>
            <Grid item>
              <Button size="small" variant="outlined" onClick={handleApplyMaxBalance}>
                max
              </Button>
            </Grid>
            <Grid item>
              <OptionToken token={ibBTC.token} />
            </Grid>
          </InputTokenActionButtonsGrid>
        </BorderedFocusableContainerGrid>
      </Grid>
      <Grid item container alignItems="center" xs={12}>
        <DownArrow />
      </Grid>
      <Grid container className={classes.outputContent}>
        <OutputContentGrid container item xs={12}>
          <Grid item xs={12} sm={7} md={12} lg={7}>
            <OutputAmountText variant="h3">{outputAmount || '0.000'}</OutputAmountText>
          </Grid>
          <OutputTokenGrid item container xs={12} sm={5} md={12} lg={5}>
            <OptionTokens
              balances={redeemOptions}
              selected={selectedToken || redeemOptions[0]}
              onTokenSelect={handleTokenChange}
            />
          </OutputTokenGrid>
        </OutputContentGrid>
      </Grid>
      {selectedToken && (
        <Grid item xs={12}>
          <SummaryGrid>
            {!isEnoughToRedeem && maxRedeem && (
              <Grid item xs={12} container>
                <ErrorText variant="subtitle1">
                  <span>A maximum of </span>
                  <Tooltip
                    enterTouchDelay={0}
                    className={classes.maxAmount}
                    title="Apply limit"
                    arrow
                    placement="top"
                    onClick={() => handleLimitClick(maxRedeem)}
                  >
                    <span>{TokenBalance.fromBigNumber(ibBTC, maxRedeem).balanceDisplay(6)}</span>
                  </Tooltip>
                  <span>
                    {' '}
                    {ibBTC.token.symbol} can be redeemed for {selectedToken.token.symbol}.
                  </span>
                </ErrorText>
              </Grid>
            )}
            <Grid item xs={12} container justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="subtitle1">Current Conversion Rate: </Typography>
              </Grid>
              <Grid item xs={6}>
                <EndAlignText variant="body1">
                  1 {ibBTC.token.symbol} : {conversionRate || redeemBalanceRedeemRate} {selectedToken.token.symbol}
                </EndAlignText>
              </Grid>
            </Grid>
            <Grid item xs={12} container justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="subtitle1">Fees: </Typography>
              </Grid>
              <Grid item xs={6}>
                <EndAlignText variant="body1">
                  <Tooltip
                    enterTouchDelay={0}
                    enterDelay={0}
                    leaveDelay={300}
                    arrow
                    placement="left"
                    title={'Redeem Fee: ' + redeemFeePercent + '%'}
                  >
                    <span>
                      {fee} {ibBTC.token.symbol}
                    </span>
                  </Tooltip>
                </EndAlignText>
              </Grid>
            </Grid>
            <Grid item xs={12} container justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="subtitle1">Total Redeem Amount: </Typography>
              </Grid>
              <Grid item xs={6}>
                <EndAlignText variant="body1">{`${totalRedeem} ${selectedToken.token.symbol}`}</EndAlignText>
              </Grid>
            </Grid>
          </SummaryGrid>
        </Grid>
      )}
      <Grid item xs={12}>
        <ActionButton>
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            onClick={handleRedeemClick}
            disabled={!isEnoughToRedeem || !inputAmount || !outputAmount}
          >
            REDEEM
          </Button>
        </ActionButton>
      </Grid>
    </>
  );
});
