import { TransactionStatus, VaultDTO } from '@badger-dao/sdk';
import { Box, Dialog, Grid, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VaultLogo from 'components-v2/landing/VaultLogo';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { AdvisoryType } from 'mobx/model/vaults/advisory-type';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';
import { Id, toast } from 'react-toastify';
import { useNumericInput } from 'utils/useNumericInput';

import { showTransferRejectedToast, showTransferSignedToast, showWalletPromptToast } from '../../../utils/toasts';
import TxCompletedToast, { TX_COMPLETED_TOAST_DURATION } from '../../TransactionToast';
import { PercentageSelector } from '../PercentageSelector';
import { ActionButton, LoaderSpinner, PercentagesContainer, VaultDialogContent } from './styled';
import VaultAdvisory from './VaultAdvisory';
import { VaultConversionAndFee } from './VaultConversionAndFee';
import { VaultDialogTitle } from './VaultDialogTitle';

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(0, 3, 3, 3),
    color: 'rgba(255,255,255,0.6)',
  },
  fees: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(0, 2),
  },
  rate: {
    marginTop: theme.spacing(1),
  },
  geyserDeposit: {
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(2),
    width: '100%',
  },
  geyserIcon: {
    color: theme.palette.primary.main,
  },
  legacyAppLink: {
    margin: '0px 3px',
  },
  tokenBox: {
    background: '#121212',
    borderRadius: 8,
    padding: '15px 20px 25px',
    '& .token-label': {
      fontSize: 12,
      marginBottom: 5,
      color: theme.palette.primary.main,
    },
    '& .token-logo-name': {
      border: `1px solid ${theme.palette.primary.main}`,
      background: '#FFFFFF26',
      padding: '15px 20px',
      borderRadius: 8,
      marginRight: 10,
      maxHeight: 55,
      height: '100%',
      '& img': {
        maxWidth: 24,
      },
      '& .token-name': {
        paddingLeft: 5,
      },
      [theme.breakpoints.down('sm')]: {
        marginRight: 0,
      },
    },
    '& .token-balance-percentage': {
      marginTop: 20,
      '& .token-balance': {
        fontSize: 12,
      },
    },
  },
  amountTextField: {
    '& input': {
      color: 'rgba(255,255,255,0.6)',
      paddingTop: 4,
      paddingBottom: 0,
      fontSize: 24,
    },
    '& fieldset': {
      border: 0,
    },
  },
  amountTextFieldHasValue: {
    '& input': {
      color: 'rgba(255,255,255,0.87)',
    },
  },
  amountDollarValue: {
    marginTop: 2,
    paddingRight: 15,
    color: 'rgba(255,255,255,0.6)',
    '& p': {
      fontSize: 12,
    },
  },
  totalAmountContainer: {
    // marginTop: theme.spacing(1),
    padding: theme.spacing(0, 2),
  },
  totalAmountLabel: {
    fontSize: 14,
    height: '100%',
    color: 'rgba(255,255,255,0.6)',
  },
  totalAmount: {
    fontSize: 24,
    color: '#FFFFFFDE',
  },
}));

export interface VaultModalProps {
  open?: boolean;
  vault: VaultDTO;
  withdrawAdvisory?: AdvisoryType;
  onClose: () => void;
}

export const VaultWithdraw = observer(({ open = false, vault, withdrawAdvisory, onClose }: VaultModalProps) => {
  const { wallet, user, vaults, sdk, transactions, vaultDetail, prices } = useContext(StoreContext);
  const classes = useStyles();

  const [accepted, setAccepted] = useState(!withdrawAdvisory);
  const [amount, setAmount] = useState('0');
  const { onValidChange, inputProps } = useNumericInput();

  const userBalance = user.getBalance(vault.vaultToken);
  const userHasBalance = userBalance.hasBalance();

  const depositToken = vaults.getToken(vault.underlyingToken);
  const bToken = vaults.getToken(vault.vaultToken);

  const vaultSymbol = vaults.getToken(vault.vaultToken).symbol;
  const depositTokenSymbol = depositToken.symbol;
  const bTokenSymbol = bToken?.symbol || '';

  const canWithdraw = wallet.isConnected && !!amount && userHasBalance;
  const isLoading = false;

  const withdraw = TokenBalance.fromString(userBalance, amount === '' ? '0' : amount);

  const handlePercentageChange = (percent: number) => {
    setAmount(userBalance.scaledBalanceDisplay(percent));
  };

  const handleSubmit = async (): Promise<void> => {
    if (withdraw.balance > 0) {
      let toastId: Id = `${vault.vaultToken}-withdrawal-${amount}`;
      const withdrawAmount = TokenBalance.fromString(userBalance, amount);
      const formattedWithdrawAmount = `${withdrawAmount.balanceDisplay(2)} ${depositToken.symbol}`;

      const result = await sdk.vaults.withdraw({
        vault: vault.vaultToken,
        amount: withdraw.tokenBalance,
        onTransferPrompt: () => {
          toastId = showWalletPromptToast(`Confirm withdraw of ${formattedWithdrawAmount}`);
        },
        onTransferSigned: ({ transaction }) => {
          if (transaction) {
            transactions.addSignedTransaction({
              hash: transaction.hash,
              addedTime: Date.now(),
              name: `Withdraw`,
              description: formattedWithdrawAmount,
            });
            showTransferSignedToast(
              toastId,
              <TxCompletedToast title={`Submitted withdraw of ${formattedWithdrawAmount}`} hash={transaction.hash} />,
            );
          }
        },
        onTransferSuccess: ({ receipt }) => {
          if (receipt) {
            transactions.updateCompletedTransaction(receipt);
            toast(<TxCompletedToast title={`Withdrew ${formattedWithdrawAmount}`} hash={receipt.transactionHash} />, {
              autoClose: TX_COMPLETED_TOAST_DURATION,
              type: receipt.status === 0 ? 'error' : 'success',
            });
          }
        },
        onError: (err) => toast.error(`Failed vault withdraw, error: ${err}`),
        onRejection: () => showTransferRejectedToast(toastId, 'Withdraw transaction canceled by user'),
      });
      if (result === TransactionStatus.Success) {
        await user.reloadBalances();
        vaultDetail.toggleWithdrawDialog();
      }
    }
  };

  if (!accepted && withdrawAdvisory) {
    return (
      <Dialog open={open} onClose={() => vaultDetail.toggleWithdrawDialog()} fullWidth maxWidth="xl">
        <VaultDialogTitle vault={vault} mode="Withdraw" onClose={() => vaultDetail.toggleWithdrawDialog()} />
        <VaultAdvisory vault={vault} accept={() => setAccepted(true)} type={withdrawAdvisory} />
      </Dialog>
    );
  }

  const withdrawFees = (
    <>
      <Grid container className={classes.fees}>
        <VaultConversionAndFee vault={vault} balance={Number(amount)} />
      </Grid>
    </>
  );

  const withdrawAmount = (Number(amount) * vault.pricePerFullShare).toFixed(6);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <VaultDialogTitle vault={vault} mode="Withdraw" onClose={onClose} />
      <VaultDialogContent className={classes.content}>
        {/* From Start */}
        <Box className={classes.tokenBox}>
          <Typography className="token-label">From</Typography>
          <Grid container>
            <Grid item xs={12} sm={7}>
              <Box className="token-logo-name" display="flex" alignItems="center">
                <VaultLogo tokens={vault.tokens} />
                <Typography className="token-name">{vault.name}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Type an amount to withdraw"
                inputProps={inputProps}
                value={amount || ''}
                onChange={onValidChange(setAmount)}
                className={`${classes.amountTextField} ${
                  Number(amount) || amount.length > 1 ? classes.amountTextFieldHasValue : ''
                }`}
              />
              <Box display="flex" justifyContent="flex-end" className={classes.amountDollarValue}>
                <Typography>~${amount ? Number(amount) * prices.getPrice(vault.vaultToken) : amount}</Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid container alignItems="center" className="token-balance-percentage">
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" color="textSecondary" className="token-balance">
                {`1 ${bTokenSymbol} = ${vault.pricePerFullShare} ${depositTokenSymbol}`}
              </Typography>
            </Grid>
            <PercentagesContainer item xs={12} sm={6}>
              <PercentageSelector size="small" options={[25, 50, 75, 100]} onChange={handlePercentageChange} />
            </PercentagesContainer>
          </Grid>
        </Box>
        {/* From End */}
        {/* To Start */}
        <Box className={classes.tokenBox} sx={{ marginTop: 10 }}>
          <Typography className="token-label">To</Typography>
          <Grid container>
            <Grid item xs={12} sm={7}>
              <Box className="token-logo-name" display="flex" alignItems="center">
                <VaultLogo tokens={vault.tokens} />
                <Typography className="token-name">{depositToken.name}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                variant="outlined"
                fullWidth
                // placeholder="Type an amount to deposit"
                inputProps={inputProps}
                value={withdrawAmount || ''}
                // onChange={onValidChange(setAmount)}
                className={`${classes.amountTextField} ${
                  Number(withdrawAmount) || withdrawAmount.length > 1 ? classes.amountTextFieldHasValue : ''
                }`}
              />
              <Box display="flex" justifyContent="flex-end" className={classes.amountDollarValue}>
                <Typography>~${amount ? Number(amount) * prices.getPrice(vault.underlyingToken) : amount}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        {/* To End */}
        {withdrawFees}
        <ActionButton
          aria-label="Withdraw"
          size="large"
          disabled={isLoading || !canWithdraw}
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          fullWidth
        >
          {isLoading ? (
            <>
              Withdraw In Progress
              <LoaderSpinner size={20} />
            </>
          ) : (
            `Withdraw ${vault.asset}`
          )}
        </ActionButton>
      </VaultDialogContent>
    </Dialog>
  );
});
