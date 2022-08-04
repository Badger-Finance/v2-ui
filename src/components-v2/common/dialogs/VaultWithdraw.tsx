import { TransactionStatus, VaultDTO } from '@badger-dao/sdk';
import { Dialog, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer, VaultDialogContent } from './styled';
import VaultAdvisory from './VaultAdvisory';
import { VaultConversionAndFee } from './VaultConversionAndFee';
import { VaultDialogTitle } from './VaultDialogTitle';

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(3),
  },
  fees: {
    marginTop: theme.spacing(2),
  },
  rate: {
    marginTop: theme.spacing(1),
  },
  rateLabel: {
    fontSize: 12,
    lineHeight: '1.66',
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
}));

export interface VaultModalProps {
  open?: boolean;
  vault: VaultDTO;
  withdrawAdvisory?: AdvisoryType;
  onClose: () => void;
}

export const VaultWithdraw = observer(({ open = false, vault, withdrawAdvisory, onClose }: VaultModalProps) => {
  const { wallet, user, vaults, sdk, transactions, vaultDetail } = useContext(StoreContext);
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

  const withdraw = TokenBalance.fromString(userBalance, amount);

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
        <VaultDialogTitle vault={vault} mode="Withdraw" />
        <VaultAdvisory vault={vault} accept={() => setAccepted(true)} type={withdrawAdvisory} />
      </Dialog>
    );
  }

  const withdrawFees = (
    <>
      <AmountTextField
        variant="outlined"
        fullWidth
        placeholder="Type an amount to withdraw"
        inputProps={inputProps}
        value={amount || ''}
        onChange={onValidChange(setAmount)}
      />
      <Grid container justifyContent="space-between" className={classes.rate}>
        <Typography className={classes.rateLabel} color="textSecondary" display="inline">
          Withdraw Rate
        </Typography>
        <Typography display="inline" variant="subtitle2">
          {`1 ${bTokenSymbol} = ${vault.pricePerFullShare} ${depositTokenSymbol}`}
        </Typography>
      </Grid>
      <Grid container className={classes.fees}>
        <VaultConversionAndFee vault={vault} balance={Number(amount)} />
      </Grid>
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <VaultDialogTitle vault={vault} mode="Withdraw" />
      <VaultDialogContent dividers className={classes.content}>
        <Grid container alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" color="textSecondary">
              {`Deposited ${vaultSymbol}: ${userBalance.balanceDisplay()}`}
            </Typography>
          </Grid>
          <PercentagesContainer item xs={12} sm={6}>
            <PercentageSelector size="small" options={[25, 50, 75, 100]} onChange={handlePercentageChange} />
          </PercentagesContainer>
        </Grid>
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
            'Withdraw'
          )}
        </ActionButton>
      </VaultDialogContent>
    </Dialog>
  );
});
