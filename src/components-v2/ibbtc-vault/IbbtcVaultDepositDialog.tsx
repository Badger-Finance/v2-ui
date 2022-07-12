import { TransactionStatus } from '@badger-dao/sdk';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ReportProblem } from '@material-ui/icons';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { BigNumber, ethers, utils } from 'ethers';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { Chain } from 'mobx/model/network/chain';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Id, toast } from 'react-toastify';

import { Loader } from '../../components/Loader';
import { METAMASK_REJECTED__SIGNATURE_ERROR_CODE } from '../../config/constants';
import mainnetDeploy from '../../config/deployments/mainnet.json';
import { IbbtcVaultZap__factory } from '../../contracts';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import {
  showTransferRejectedToast,
  showTransferSignedToast,
  showWalletPromptToast,
  updateWalletPromptToast,
} from '../../utils/toasts';
import { VaultModalProps } from '../common/dialogs/VaultDeposit';
import { StrategyFees } from '../common/StrategyFees';
import VaultLogo from '../landing/VaultLogo';
import TxCompletedToast, { TX_COMPLETED_TOAST_DURATION } from '../TransactionToast';
import BalanceInput from './BalanceInput';
import SlippageMessage from './SlippageMessage';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 680,
  },
  tab: {
    textTransform: 'none',
  },
  avatar: {
    display: 'inline-block',
    marginRight: theme.spacing(2),
    width: 43,
    height: 43,
  },
  title: {
    padding: theme.spacing(4, 4, 0, 4),
  },
  content: {
    padding: theme.spacing(2, 4, 4, 4),
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 24,
  },
  inputRow: {
    marginTop: theme.spacing(1.5),
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
  inputsContainer: {
    marginTop: theme.spacing(2),
  },
  depositButton: {
    marginTop: theme.spacing(1),
  },
  loader: {
    marginBottom: theme.spacing(1),
  },
  slippageProtectionContainer: {
    borderRadius: 8,
    border: '1px solid #D97706',
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1),
  },
  slippageProtectionMessage: {
    color: '#D97706',
    verticalAlign: 'middle',
    display: 'inline-flex',
  },
  warningIcon: {
    color: '#D97706',
    marginRight: theme.spacing(1),
  },
  depositContent: {
    marginTop: theme.spacing(2),
  },
  estimations: {},
}));

enum DepositMode {
  Tokens = 'tokens',
  LiquidityToken = 'liquidity-token',
}

const IbbtcVaultDepositDialog = ({ open = false }: VaultModalProps): JSX.Element => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { network, wallet, vaults, vaultDetail, user, sdk, transactions } = store;

  // lp token getters
  const lpVault = vaults.getVault(mainnetDeploy.sett_system.vaults['native.ibbtcCrv']);
  const lpBadgerVault = vaults.vaultOrder.find(({ vaultToken }) => vaultToken === lpVault?.vaultToken);
  const userLpTokenBalance = lpBadgerVault ? user.getBalance(lpBadgerVault.vaultToken) : undefined;
  const userHasLpTokenBalance = userLpTokenBalance?.tokenBalance.gt(0);
  const settStrategy = lpBadgerVault ? Chain.getChain(network.network).strategies[lpBadgerVault.vaultToken] : undefined;

  // options
  const [mode, setMode] = useState(userHasLpTokenBalance ? DepositMode.LiquidityToken : DepositMode.Tokens);
  const [depositOptions, setDepositOptions] = useState<TokenBalance[]>([]);

  // user inputs
  const [slippage, setSlippage] = useState(0.3);
  const [multiTokenDepositBalances, setMultiTokenDepositBalances] = useState<TokenBalance[]>([]);
  const [lpTokenDepositBalance, setLpTokenDepositBalance] = useState<TokenBalance>();

  // calculations
  const [slippageRevertProtected, setSlippageRevertProtected] = useState(false);
  const [expectedSlippage, setExpectedSlippage] = useState<BigNumber>();
  const [expectedPoolTokens, setExpectedPoolTokens] = useState<TokenBalance>();
  const [minPoolTokens, setMinPoolTokens] = useState<TokenBalance>();

  const areUserTokenBalancesAvailable = Object.keys(user.balances).length > 0;
  const isLoading = !areUserTokenBalancesAvailable || !lpBadgerVault;

  const totalDeposit = multiTokenDepositBalances.reduce(
    (total, balance) => total.add(balance.tokenBalance),
    ethers.constants.Zero,
  );

  const multiTokenDisabled = totalDeposit.isZero() || slippageRevertProtected;
  const lpTokenDisabled = !lpTokenDepositBalance || lpTokenDepositBalance.tokenBalance.isZero();

  const resetCalculatedInformation = useCallback(() => {
    setMultiTokenDepositBalances(depositOptions);
    setSlippageRevertProtected(false);
    setExpectedSlippage(undefined);
    setExpectedPoolTokens(undefined);
    setMinPoolTokens(undefined);
  }, [depositOptions]);

  const getCalculations = useCallback(
    async (balances: TokenBalance[]): Promise<BigNumber[]> => {
      const { provider } = sdk;
      const ibbtcVaultPeak = IbbtcVaultZap__factory.connect(mainnetDeploy.ibbtcVaultZap, provider);
      const tokenBalances = balances.map((balance) => balance.tokenBalance);
      const [calculatedMint, expectedAmount] = await Promise.all([
        ibbtcVaultPeak.calcMint([tokenBalances[0], tokenBalances[1], tokenBalances[2], tokenBalances[3]], false),
        ibbtcVaultPeak.expectedAmount([tokenBalances[0], tokenBalances[1], tokenBalances[2], tokenBalances[3]]),
      ]);
      return [calculatedMint, expectedAmount];
    },
    [wallet],
  );

  const handleClosing = () => {
    setSlippageRevertProtected(false);
    setExpectedSlippage(undefined);
    vaultDetail.toggleDepositDialog();
  };

  const handleModeChange = (newMode: DepositMode) => {
    resetCalculatedInformation();
    setMode(newMode);
  };

  const handleSlippageChange = async (newSlippage: number) => {
    const totalDeposit = multiTokenDepositBalances.reduce(
      (total, balance) => total.add(balance.tokenBalance),
      ethers.constants.Zero,
    );

    if (!userLpTokenBalance || totalDeposit.isZero()) {
      setSlippage(newSlippage);
      return;
    }

    const [calculatedMint, expectedAmount] = await getCalculations(multiTokenDepositBalances);
    const calculatedMinOut = +formatEther(expectedAmount) * (1 - slippage / 100);
    const minOut = parseEther(calculatedMinOut.toString());
    const calculatedSlippage = expectedAmount.sub(calculatedMint).mul(utils.parseEther('100')).div(expectedAmount);

    setSlippage(newSlippage);
    setMinPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, minOut));
    setExpectedPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, calculatedMint));
    setSlippageRevertProtected(calculatedMint.lt(minOut));
    setExpectedSlippage(calculatedSlippage);
  };

  const handleDepositBalanceChange = async (tokenBalance: TokenBalance, index: number) => {
    const balances = [...multiTokenDepositBalances];
    balances[index] = tokenBalance;
    const totalDeposit = balances.reduce((total, balance) => total.add(balance.tokenBalance), ethers.constants.Zero);

    if (totalDeposit.isZero()) {
      setMultiTokenDepositBalances(balances);
      setSlippageRevertProtected(false);
      setExpectedSlippage(undefined);
      setExpectedPoolTokens(undefined);
      setMinPoolTokens(undefined);
      return;
    }

    const [calculatedMint, expectedAmount] = await getCalculations(balances);
    // formula: slippage = [(expectedAmount - calculatedMint) * 100] / expectedAmount
    const calculatedSlippage = expectedAmount.sub(calculatedMint).mul(utils.parseEther('100')).div(expectedAmount);
    const calculatedMinOut = +formatEther(expectedAmount) * (1 - slippage / 100);
    const minOut = parseEther(calculatedMinOut.toString());

    if (userLpTokenBalance) {
      setMinPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, minOut));
      setExpectedPoolTokens(TokenBalance.fromBigNumber(userLpTokenBalance, calculatedMint));
    }

    // this will protect users from submitting tx that will be reverted because of slippage
    setSlippageRevertProtected(calculatedMint.lt(minOut));
    setExpectedSlippage(calculatedSlippage);
    setMultiTokenDepositBalances(balances);
  };

  const handleLpTokenDeposit = async () => {
    if (!lpTokenDepositBalance || !userLpTokenBalance || !lpVault || !lpBadgerVault) {
      return;
    }

    if (lpTokenDepositBalance.tokenBalance.gt(userLpTokenBalance.tokenBalance)) {
      toast.error('You do not have enough LP tokens to deposit this amount');
      return;
    }

    const depositAmount = `${lpTokenDepositBalance.balanceDisplay(2)} ${lpTokenDepositBalance.token.symbol}`;
    let toastId: Id = 'deposit-lp-token-toast';

    const result = await sdk.vaults.deposit({
      vault: lpVault.vaultToken,
      amount: lpTokenDepositBalance.tokenBalance,
      onApprovePrompt: () => {
        toastId = showWalletPromptToast('Confirm approval of tokens for deposit');
      },
      onApproveSigned: () => updateWalletPromptToast(toastId, 'Submitted approval of tokens for deposit'),
      onApproveSuccess: () => {
        toast.info(`Completed approval of tokens for deposit of ${depositAmount}`);
      },
      onTransferPrompt: () => {
        toastId = showWalletPromptToast(`Confirm deposit of ${lpTokenDepositBalance.token.symbol}`);
      },
      onTransferSigned: ({ transaction }) => {
        if (transaction) {
          transactions.addSignedTransaction({
            hash: transaction.hash,
            addedTime: Date.now(),
            name: 'Deposit',
            description: depositAmount,
          });
          showTransferSignedToast(
            toastId,
            <TxCompletedToast title={`Submitted deposit of ${depositAmount}`} hash={transaction.hash} />,
          );
        }
      },
      onTransferSuccess: ({ receipt }) => {
        if (receipt) {
          transactions.updateCompletedTransaction(receipt);
          toast(<TxCompletedToast title={`Deposit ${depositAmount}`} hash={receipt.transactionHash} />, {
            type: receipt.status === 0 ? 'error' : 'success',
            autoClose: TX_COMPLETED_TOAST_DURATION,
          });
        }
      },
      onError: (err) => toast.error(`Failed vault deposit, error: ${err}`),
      onRejection: () => showTransferRejectedToast(toastId, 'Deposit transaction canceled by user'),
    });

    if (result === TransactionStatus.Success) {
      await user.reloadBalances();
    }
  };

  const handleMultiTokenDeposit = async () => {
    if (!sdk.signer) return;

    const invalidBalance = multiTokenDepositBalances.find((depositBalance, index) => {
      const depositOption = depositOptions[index];
      return depositBalance.tokenBalance.gt(depositOption.tokenBalance);
    });

    if (invalidBalance) {
      toast.error(`Insufficient ${invalidBalance.token.symbol} balance for deposit`);
      return;
    }

    const nonZeroBalances = multiTokenDepositBalances.filter((depositBalance) => !depositBalance.tokenBalance.isZero());
    let canContinue = true;
    let approvalId: Id = 'deposit';

    await Promise.all(
      nonZeroBalances.map((depositBalance) =>
        sdk.tokens.verifyOrIncreaseAllowance({
          spender: mainnetDeploy.ibbtcVaultZap,
          token: depositBalance.token.address,
          amount: depositBalance.tokenBalance,
          onApprovePrompt: () => {
            approvalId = showWalletPromptToast(`Approve ${depositBalance.token.symbol} deposit`);
          },
          onApproveSigned: () =>
            updateWalletPromptToast(approvalId, `Submitted approval of ${depositBalance.token.symbol}`),
          onRejection: () => {
            canContinue = false;
            showTransferRejectedToast(approvalId, 'Approval rejected by user');
          },
          onError: (err) => {
            canContinue = false;
            toast.update(approvalId, {
              type: 'error',
              render: `Approval of balance failed: ${err}`,
              autoClose: undefined,
            });
          },
        }),
      ),
    );

    // we don't want to continue if any of the approvals failed
    if (!canContinue) {
      return;
    }

    const ibbtcVaultPeak = IbbtcVaultZap__factory.connect(mainnetDeploy.ibbtcVaultZap, sdk.signer);
    const tokenBalances = multiTokenDepositBalances.map((balance) => balance.tokenBalance);
    const tokensUsed = multiTokenDepositBalances.filter((balance) => !balance.tokenBalance.isZero());

    const expectedAmount = await ibbtcVaultPeak.expectedAmount([
      tokenBalances[0],
      tokenBalances[1],
      tokenBalances[2],
      tokenBalances[3],
    ]);

    const calculatedMinOut = +formatEther(expectedAmount) * (1 - slippage / 100);
    const minOut = parseEther(calculatedMinOut.toString());
    const depositToastId = showWalletPromptToast('Approve deposit');

    try {
      const depositTx = await ibbtcVaultPeak.deposit(
        [tokenBalances[0], tokenBalances[1], tokenBalances[2], tokenBalances[3]],
        minOut,
        false,
      );
      transactions.addSignedTransaction({
        hash: depositTx.hash,
        addedTime: Date.now(),
        name: 'Deposit',
        description: tokensUsed
          .map((tokenBalance) => `${tokenBalance.balanceDisplay(2)} ${tokenBalance.token.symbol}`)
          .join(', '),
      });
      showTransferSignedToast(depositToastId, <TxCompletedToast title="Submitted deposit" hash={depositTx.hash} />);
      const receipt = await depositTx.wait();
      transactions.updateCompletedTransaction(receipt);
      toast(<TxCompletedToast title={`Deposit ${lpVault.name}`} hash={receipt.transactionHash} />, {
        type: receipt.status === 0 ? 'error' : 'success',
        autoClose: TX_COMPLETED_TOAST_DURATION,
      });
    } catch (err) {
      if (err.code === METAMASK_REJECTED__SIGNATURE_ERROR_CODE) {
        showTransferRejectedToast(depositToastId, 'Deposit rejected by user');
      } else {
        toast.update(depositToastId, {
          type: 'error',
          render: `Deposit failed: ${err}`,
          autoClose: undefined,
        });
      }
    }
  };

  useEffect(() => {
    const sBTC = user.getBalance(mainnetDeploy.tokens['sBTC']);
    const renBTC = user.getBalance(mainnetDeploy.tokens['renBTC']);
    const wBTC = user.getBalance(mainnetDeploy.tokens['wBTC']);
    const ibbtc = user.getBalance(mainnetDeploy.tokens['ibBTC']);
    setDepositOptions([ibbtc, renBTC, wBTC, sBTC]);
    setMultiTokenDepositBalances([ibbtc, renBTC, wBTC, sBTC]);
  }, [user]);

  useEffect(() => {
    const lpVault = vaults.getVault(mainnetDeploy.sett_system.vaults['native.ibbtcCrv']);
    const userLpTokenBalance = user.getBalance(lpVault.vaultToken);

    if (userLpTokenBalance.balance === 0) {
      return;
    }

    const userHasLpTokenBalance = userLpTokenBalance.tokenBalance.gt(0);

    setLpTokenDepositBalance(userLpTokenBalance);
    setMode(userHasLpTokenBalance ? DepositMode.LiquidityToken : DepositMode.Tokens);
  }, [user, vaults, vaults.vaultOrder]);

  return (
    <Dialog open={open} fullWidth maxWidth="xl" onClose={handleClosing} classes={{ paperWidthXl: classes.root }}>
      <DialogTitle className={classes.title}>
        Deposit Tokens
        <IconButton className={classes.closeButton} onClick={handleClosing}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.content}>
        {isLoading ? (
          <Grid container direction="column">
            <Grid item className={classes.loader}>
              <Loader size={48} />
            </Grid>
            <Grid item container justifyContent="center">
              <Typography variant="h6" display="inline">
                Loading
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Grid container direction="column">
            <Grid item container>
              {lpVault && (
                <Box marginRight={2}>
                  <VaultLogo tokens={lpVault.tokens} />
                </Box>
              )}
              <Box display="inline-block">
                <Typography variant="body1">RenBTC / wBTC/ ibBTC LP</Typography>
                <Typography variant="body1">Convex</Typography>
              </Box>
            </Grid>
            <Grid item container className={classes.depositContent}>
              <Tabs
                value={mode}
                textColor="primary"
                indicatorColor="primary"
                onChange={(e, newMode) => handleModeChange(newMode)}
                aria-label="wrapped label tabs example"
              >
                <Tab className={classes.tab} value={DepositMode.Tokens} label="ibBTC, renBTC, WBTC & sBTC" />
                <Tab className={classes.tab} value={DepositMode.LiquidityToken} label="LP Token" />
              </Tabs>
              <Grid container direction="column" className={classes.inputsContainer}>
                {mode === DepositMode.Tokens ? (
                  <>
                    {depositOptions.map((tokenBalance, index) => (
                      <Grid item key={`${tokenBalance.token.address}_${index}`} className={classes.inputRow}>
                        <BalanceInput
                          tokenBalance={tokenBalance}
                          onChange={(change) => handleDepositBalanceChange(change, index)}
                        />
                      </Grid>
                    ))}
                    <Grid
                      item
                      container
                      justifyContent="space-between"
                      alignItems="center"
                      className={classes.inputRow}
                    >
                      <Typography variant="subtitle2">Slippage</Typography>
                      <RadioGroup
                        row
                        value={slippage}
                        onChange={(event) => handleSlippageChange(Number(event.target.value))}
                      >
                        {[0.15, 0.3, 0.5, 1].map((slippageOption, index) => (
                          <FormControlLabel
                            key={`${slippageOption}_${index}`}
                            control={<Radio color="primary" />}
                            label={`${slippageOption} % `}
                            value={slippageOption}
                          />
                        ))}
                      </RadioGroup>
                    </Grid>
                  </>
                ) : (
                  <Grid item className={classes.inputRow}>
                    {userLpTokenBalance && (
                      <BalanceInput
                        tokenBalance={userLpTokenBalance}
                        onChange={(change) => setLpTokenDepositBalance(change)}
                      />
                    )}
                  </Grid>
                )}
              </Grid>
            </Grid>
            {mode === DepositMode.Tokens && (
              <Grid item container direction="column" className={clsx(classes.inputRow, classes.estimations)}>
                {expectedPoolTokens && (
                  <Grid item container justifyContent="space-between">
                    <Typography variant="body2">Expected Pool Tokens Received:</Typography>
                    <Typography variant="body2">{expectedPoolTokens.balanceDisplay(4)}</Typography>
                  </Grid>
                )}
                {minPoolTokens && (
                  <Grid item container justifyContent="space-between">
                    <Typography variant="body2">Min Pool tokens Received:</Typography>
                    <Typography variant="body2">{minPoolTokens.balanceDisplay(4)}</Typography>
                  </Grid>
                )}
                {expectedSlippage && (
                  <Grid item>
                    <SlippageMessage limitSlippage={slippage} calculatedSlippage={expectedSlippage} />
                  </Grid>
                )}
              </Grid>
            )}
            {slippageRevertProtected && (
              <Grid item container direction="row" alignItems="center" className={classes.slippageProtectionContainer}>
                <Typography variant="subtitle2" className={classes.slippageProtectionMessage}>
                  <ReportProblem className={classes.warningIcon} />
                  With your current slippage selection the transaction will be reverted, please adjust either slippage
                  limit or deposit amount.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
        <Divider className={classes.divider} variant="fullWidth" />
        {lpVault && <StrategyFees vault={lpVault} />}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          className={classes.depositButton}
          disabled={mode === DepositMode.Tokens ? multiTokenDisabled : lpTokenDisabled}
          onClick={mode === DepositMode.Tokens ? handleMultiTokenDeposit : handleLpTokenDeposit}
        >
          {slippageRevertProtected ? 'Slippage out of range' : 'Deposit'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default observer(IbbtcVaultDepositDialog);
