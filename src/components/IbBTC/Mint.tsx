import { TransactionStatus } from '@badger-dao/sdk';
import {
  Button,
  debounce,
  FormControlLabel,
  Grid,
  InputAdornment,
  OutlinedInput,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { makeStyles, styled } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Id, toast } from 'react-toastify';
import { useNumericInput } from 'utils/useNumericInput';
import { FLAGS } from '../../config/environment';

import TxCompletedToast, { TX_COMPLETED_TOAST_DURATION } from '../../components-v2/TransactionToast';
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
  InputTokenActionButtonsGrid,
  InputTokenAmount,
  OutputAmountText,
  OutputBalanceText,
  OutputContentGrid,
  OutputTokenGrid,
  SummaryGrid,
} from './Common';
import { DownArrow } from './DownArrow';
import { OptionToken } from './OptionToken';
import { OptionTokens } from './OptionTokens';

const SlippageContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(1),
  [theme.breakpoints.only('xs')]: {
    marginTop: theme.spacing(2),
  },
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  flexDirection: 'row',
  marginLeft: theme.spacing(2),
}));

const useStyles = makeStyles({
  customSlippage: {
    padding: 8,
    width: 30,
  },
  loader: {
    display: 'inline-block',
    width: 32,
  },
});

interface ButtonProps {
  children: React.ReactNode;
}

const ActionButton = observer(({ children }: ButtonProps): JSX.Element => {
  return <>{children}</>;
});

export const Mint = observer((): JSX.Element => {
  const store = useContext(StoreContext);
  const classes = useStyles();

  const {
    ibBTCStore: { ibBTC, mintFeePercent, mintOptions, mintRates, tokenBalances, initialized },
    transactions,
    wallet,
    sdk,
    user,
  } = store;

  const [selectedToken, setSelectedToken] = useState<TokenBalance>();
  const [inputAmount, setInputAmount] = useState('');
  const [mintBalance, setMintBalance] = useState<TokenBalance>();
  const [outputAmount, setOutputAmount] = useState<string>();
  const [fee, setFee] = useState('0.000');
  const [totalMint, setTotalMint] = useState('0.000');
  const [slippage, setSlippage] = useState<string | undefined>('1');
  const [customSlippage, setCustomSlippage] = useState<string>();
  const { onValidChange, inputProps } = useNumericInput();
  const showSlippage = mintBalance ? store.ibBTCStore.isZapToken(mintBalance.token) : false;

  const mintBalanceRate = mintBalance ? mintRates[mintBalance.token.address] : undefined;

  const selectedTokenBalance = tokenBalances.find(
    (tokenBalance) => tokenBalance.token.address === mintBalance?.token.address,
  );

  const resetState = () => {
    setInputAmount('');
    setFee('0.000');
    setTotalMint('0.000');
  };

  const setMintInformation = (inputAmount: TokenBalance, outputAmount: TokenBalance, fee: TokenBalance): void => {
    setFee(fee.balanceDisplay(6));
    setTotalMint(outputAmount.balanceDisplay(6));
    setOutputAmount(outputAmount.balanceDisplay(6));
  };

  const calculateMintInformation = async (settTokenAmount: TokenBalance): Promise<void> => {
    const { bbtc, fee } = await sdk.ibbtc.estimateMint(settTokenAmount.token.address, settTokenAmount.tokenBalance);
    setMintInformation(
      settTokenAmount,
      TokenBalance.fromBigNumber(ibBTC, bbtc),
      TokenBalance.fromBigNumber(ibBTC, fee),
    );
  };

  const handleInputChange = (change: string) => {
    if (!selectedToken) {
      return;
    }

    setInputAmount(change);
    setMintBalance(TokenBalance.fromBalance(selectedToken, Number(change)));
    debounceInputAmountChange(change);
  };

  const handleCustomSlippageChange = (change: string) => {
    setSlippage(undefined);
    setCustomSlippage(change);
  };

  const handleSlippageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSlippage(undefined);
    setSlippage((event.target as HTMLInputElement).value);
  };

  const debounceInputAmountChange = useCallback(
    debounce(async (change: string): Promise<void> => {
      if (!selectedToken) {
        return;
      }

      if (!(Number(change) > 0)) {
        setOutputAmount(undefined);
        setFee('0.000');
        setTotalMint('0.000');
        return;
      }

      await calculateMintInformation(TokenBalance.fromBalance(selectedToken, Number(change)));
    }, 200),
    [selectedToken],
  );

  const handleApplyMaxBalance = async (): Promise<void> => {
    if (!selectedToken) {
      return;
    }

    setInputAmount(selectedToken.balanceDisplay(6));
    setMintBalance(selectedToken);
    await calculateMintInformation(selectedToken);
  };

  const handleTokenChange = async (tokenBalance: TokenBalance): Promise<void> => {
    setInputAmount(tokenBalance.balanceDisplay(6));
    setSelectedToken(tokenBalance);
    setMintBalance(tokenBalance);
    await calculateMintInformation(tokenBalance);
  };

  const handleMintClick = async (): Promise<void> => {
    if (!FLAGS.MINT_IBBTC) {
      return;
    }
    if (mintBalance && selectedToken) {
      const slippagePercent = Number(slippage);
      const isValidAmount = store.ibBTCStore.isValidAmount(mintBalance, selectedToken, slippagePercent);

      if (!isValidAmount) {
        return;
      }

      let toastId: Id = `mint-${selectedToken.token.address}`;
      const token = mintBalance.token.address;
      const amount = mintBalance.tokenBalance;
      const mintInputAmount = `${mintBalance.balanceDisplay(2)} ${selectedToken.token.symbol}`;

      const result = await sdk.ibbtc.mint({
        token,
        amount,
        slippage: slippagePercent,
        onApprovePrompt: () => {
          toastId = showWalletPromptToast('Confirm approval of tokens for minting');
        },
        onApproveSigned: () => updateWalletPromptToast(toastId, 'Submitted approval of tokens for minting'),
        onApproveSuccess: () => toast.info('Completed approval of tokens for minting'),
        onTransferPrompt: () => {
          toastId = showWalletPromptToast(`Confirm mint with ${mintInputAmount}`);
        },
        onTransferSigned: ({ transaction }) => {
          if (transaction) {
            transactions.addSignedTransaction({
              hash: transaction.hash,
              addedTime: Date.now(),
              name: `ibBTC Mint`,
              description: mintInputAmount,
            });
            showTransferSignedToast(
              toastId,
              <TxCompletedToast title={`Submitted mint with ${mintInputAmount}`} hash={transaction.hash} />,
            );
          }
        },
        onTransferSuccess: ({ receipt }) => {
          if (receipt) {
            transactions.updateCompletedTransaction(receipt);
            toast(<TxCompletedToast title={`Mint with ${mintInputAmount}`} hash={receipt.transactionHash} />, {
              type: receipt.status === 0 ? 'error' : 'success',
              autoClose: TX_COMPLETED_TOAST_DURATION,
            });
          }
        },

        onError: (err) => toast.error(`Failed ibBTC mint, error: ${err}`),
        onRejection: () => showTransferRejectedToast(toastId, 'Mint transaction canceled by user'),
      });

      if (result === TransactionStatus.Success) {
        resetState();
        await user.reloadBalances();
      }
    }
  };

  useEffect(() => {
    resetState();
  }, [wallet.address]);

  useEffect(() => {
    const defaultBalance = mintOptions[0];

    // reload balance to load symbol that's loaded async
    if (!mintBalance && !selectedToken && defaultBalance.token.symbol) {
      setSelectedToken(defaultBalance);
      setMintBalance(defaultBalance);
    }
  }, [selectedToken, mintOptions, mintBalance]);

  return (
    <>
      <Grid container>
        <BalanceGrid item xs={12}>
          <EndAlignText variant="body1" color="textSecondary">
            Balance: {selectedTokenBalance?.balanceDisplay(8) ?? '0'}
          </EndAlignText>
        </BalanceGrid>
        <BorderedFocusableContainerGrid item container xs={12}>
          <Grid item xs={12} sm={5}>
            <InputTokenAmount
              inputProps={inputProps}
              disabled={!wallet.isConnected}
              value={inputAmount || ''}
              placeholder="0.000"
              onChange={onValidChange(handleInputChange)}
            />
          </Grid>
          <InputTokenActionButtonsGrid item container spacing={1} xs={12} sm={7}>
            <Grid item>
              <Button size="small" variant="outlined" onClick={handleApplyMaxBalance}>
                max
              </Button>
            </Grid>
            <Grid item>
              <OptionTokens
                balances={mintOptions}
                selected={selectedToken || mintOptions[0]}
                onTokenSelect={handleTokenChange}
              />
            </Grid>
          </InputTokenActionButtonsGrid>
        </BorderedFocusableContainerGrid>
        {showSlippage && (
          <SlippageContainer item container xs={12} alignItems="center">
            <Typography variant="body1" color="textSecondary">
              Max slippage:
            </Typography>
            <StyledRadioGroup
              aria-label="slippage-percentage"
              name="slippage-percentage"
              value={slippage || ''}
              onChange={handleSlippageChange}
            >
              <FormControlLabel value="0.5" control={<Radio color="primary" />} label="0.5%" />
              <FormControlLabel value="1" control={<Radio color="primary" />} label="1%" />
            </StyledRadioGroup>
            <OutlinedInput
              value={customSlippage || ''}
              onChange={onValidChange(handleCustomSlippageChange)}
              inputProps={{ className: classes.customSlippage, ...inputProps }}
              endAdornment={<InputAdornment position="end">%</InputAdornment>}
            />
          </SlippageContainer>
        )}
      </Grid>
      <Grid item container alignItems="center" xs={12}>
        <DownArrow />
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <OutputBalanceText variant="body1" color="textSecondary">
            Balance: {ibBTC.balanceDisplay(6)}
          </OutputBalanceText>
        </Grid>
        <OutputContentGrid container item xs={12}>
          <Grid item xs={12} sm={9} md={12} lg={10}>
            <OutputAmountText variant="h3">{outputAmount || '0.000'}</OutputAmountText>
          </Grid>
          <OutputTokenGrid item container xs={12} sm={3} md={12} lg={2}>
            <OptionToken token={ibBTC.token} />
          </OutputTokenGrid>
        </OutputContentGrid>
      </Grid>
      {selectedToken && (
        <Grid item xs={12}>
          <SummaryGrid>
            <Grid item xs={12} container justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="subtitle1">Current Conversion Rate: </Typography>
              </Grid>
              <Grid item xs={6}>
                <EndAlignText variant="body1">
                  1 {selectedToken.token.symbol} : {mintBalanceRate || <Skeleton className={classes.loader} />}{' '}
                  {ibBTC.token.symbol}
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
                    title={'Mint Fee: ' + mintFeePercent + '%'}
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
                <Typography variant="subtitle1">Total Mint Amount: </Typography>
              </Grid>
              <Grid item xs={6}>
                <EndAlignText variant="body1">{`${totalMint} ${ibBTC.token.symbol}`}</EndAlignText>
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
            onClick={handleMintClick}
            disabled={true}
            // disabled={!inputAmount || !outputAmount}
          >
            {FLAGS.MINT_IBBTC ? 'MINT' : 'Minting is disabled'}
          </Button>
        </ActionButton>
      </Grid>
    </>
  );
});
