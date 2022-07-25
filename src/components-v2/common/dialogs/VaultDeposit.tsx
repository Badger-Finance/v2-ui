import { TransactionStatus, VaultDTO, VaultState } from '@badger-dao/sdk';
import { Button, Dialog, DialogContent, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { AdvisoryType } from 'mobx/model/vaults/advisory-type';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';
import { Id, toast } from 'react-toastify';
import { useNumericInput } from 'utils/useNumericInput';

import {
  showTransferRejectedToast,
  showTransferSignedToast,
  showWalletPromptToast,
  updateWalletPromptToast,
} from '../../../utils/toasts';
import TxCompletedToast, { TX_COMPLETED_TOAST_DURATION } from '../../TransactionToast';
import { NewVaultWarning } from '../../vault-detail/NewVaultWarning';
import { DepositFeesInformation } from '../DepositFeesInformation';
import { PercentageSelector } from '../PercentageSelector';
import { VaultFees } from '../VaultFees';
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer } from './styled';
import VaultAdvisory from './VaultAdvisory';
import { VaultAvailableDeposit } from './VaultAvailableDeposit';
import { VaultDialogTitle } from './VaultDialogTitle';

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(3),
  },
  guardedVault: {
    marginBottom: theme.spacing(2),
  },
  fees: {
    marginTop: theme.spacing(2),
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    textTransform: 'none',
  },
  arrowIcon: {
    marginRight: 4,
    fontSize: 16,
    transform: 'rotate(-180deg)',
  },
}));

export interface VaultModalProps {
  open?: boolean;
  vault: VaultDTO;
  onClose: () => void;
  depositAdvisory?: AdvisoryType;
}

export const VaultDeposit = observer(({ open = false, vault, depositAdvisory, onClose }: VaultModalProps) => {
  const store = useContext(StoreContext);
  const { user, wallet, sdk, vaultDetail, transactions, vaults } = store;

  const shouldCheckAdvisory = depositAdvisory || vault.state === VaultState.Experimental;
  const [accepted, setAccepted] = useState(!shouldCheckAdvisory);
  const [showFees, setShowFees] = useState(false);
  const [amount, setAmount] = useState('0');
  const { onValidChange, inputProps } = useNumericInput();
  const classes = useStyles();

  // TODO: update this - it wasn't working anyways
  const isLoading = false;
  const userBalance = user.getBalance(vault.underlyingToken);
  const deposit = TokenBalance.fromString(userBalance, amount);
  const vaultCaps = user.vaultCaps[vault.vaultToken];

  let canDeposit = wallet.isConnected && !!amount && deposit.tokenBalance.gt(0);

  if (canDeposit && vaultCaps) {
    const vaultHasSpace = vaultCaps.totalDepositCap.gte(deposit.tokenBalance);
    const userHasSpace = vaultCaps.userDepositCap.gte(deposit.tokenBalance);
    const userHasBalance = userBalance.tokenBalance.gte(deposit.tokenBalance);
    canDeposit = vaultHasSpace && userHasSpace && userHasBalance;
  }

  const handlePercentageChange = (percent: number) => {
    setAmount(userBalance.scaledBalanceDisplay(percent));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!amount) {
      return;
    }

    const depositToken = vaults.getToken(vault.underlyingToken);
    let toastId: Id = `${vault.vaultToken}-deposit-${amount}`;
    const depositAmount = `${deposit.balanceDisplay(2)} ${depositToken.symbol}`;

    const result = await sdk.vaults.deposit({
      vault: vault.vaultToken,
      amount: deposit.tokenBalance,
      onApprovePrompt: () => {
        toastId = showWalletPromptToast('Confirm approval of tokens for deposit');
      },
      onApproveSigned: () => updateWalletPromptToast(toastId, 'Submitted approval of tokens for deposit'),
      onApproveSuccess: () => {
        toast.info(`Completed approval of tokens for deposit of ${depositAmount}`);
      },
      onTransferPrompt: () => {
        toastId = showWalletPromptToast(`Confirm deposit of ${depositAmount}`);
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
          toast(<TxCompletedToast title={`Deposited ${depositAmount}`} hash={receipt.transactionHash} />, {
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

  if (!accepted && shouldCheckAdvisory) {
    let advisory = depositAdvisory;
    if (!advisory) {
      advisory = AdvisoryType.Chadger;
    }
    return (
      <Dialog open={open} onClose={() => vaultDetail.toggleDepositDialog()} fullWidth maxWidth="xl">
        <VaultDialogTitle vault={vault} mode="Deposit" />
        <VaultAdvisory vault={vault} accept={() => setAccepted(true)} type={advisory} />
      </Dialog>
    );
  }

  if (showFees) {
    return (
      <Dialog open={open} onClose={() => vaultDetail.toggleDepositDialog()} fullWidth maxWidth="xl">
        <DepositFeesInformation
          closeIcon={
            <Button color="primary" onClick={() => setShowFees(false)} className={classes.backButton}>
              <ArrowRightAltIcon className={classes.arrowIcon} />
              Back
            </Button>
          }
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <VaultDialogTitle vault={vault} mode="Deposit" />
      <DialogContent dividers className={classes.content}>
        {vault.state === VaultState.Guarded && (
          <Grid container className={classes.guardedVault}>
            <NewVaultWarning />
          </Grid>
        )}
        <Grid container alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" color="textSecondary">
              {`Available: ${userBalance.balanceDisplay()}`}
            </Typography>
          </Grid>
          <PercentagesContainer item xs={12} sm={6}>
            <PercentageSelector size="small" options={[25, 50, 75, 100]} onChange={handlePercentageChange} />
          </PercentagesContainer>
        </Grid>
        <AmountTextField
          variant="outlined"
          fullWidth
          placeholder="Type an amount to deposit"
          inputProps={inputProps}
          value={amount || ''}
          onChange={onValidChange(setAmount)}
        />
        <VaultFees vault={vault} className={classes.fees} onHelpClick={() => setShowFees(true)} />
        <ActionButton
          aria-label="Deposit"
          size="large"
          disabled={isLoading || !canDeposit}
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          fullWidth
        >
          {isLoading ? (
            <>
              Deposit In Progress
              <LoaderSpinner size={20} />
            </>
          ) : (
            'Deposit'
          )}
        </ActionButton>
      </DialogContent>
      {vaultCaps && <VaultAvailableDeposit asset={vault.asset} vaultCaps={vaultCaps} />}
    </Dialog>
  );
});
