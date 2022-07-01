import {
  formatBalance,
  TransactionStatus,
  VaultDTO,
  VaultState,
} from '@badger-dao/sdk';
import { TokenActionCallbackInput } from '@badger-dao/sdk/lib/tokens/interfaces/token-action-callback-input.interface';
import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { AdvisoryType } from 'mobx/model/vaults/advisory-type';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';
import { toast, UpdateOptions } from 'react-toastify';
import { useNumericInput } from 'utils/useNumericInput';

import TxCompletedToast from '../../TxCompletedToast';
import { NewVaultWarning } from '../../vault-detail/NewVaultWarning';
import { DepositFeesInformation } from '../DepositFeesInformation';
import { PercentageSelector } from '../PercentageSelector';
import { VaultFees } from '../VaultFees';
import {
  ActionButton,
  AmountTextField,
  LoaderSpinner,
  PercentagesContainer,
} from './styled';
import VaultAdvisory from './VaultAdvisory';
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
  depositAdvisory?: AdvisoryType;
}

export const VaultDeposit = observer(
  ({ open = false, vault, depositAdvisory }: VaultModalProps) => {
    const store = useContext(StoreContext);
    const { user, wallet, sdk, vaultDetail, transactions, vaults } = store;

    const shouldCheckAdvisory =
      depositAdvisory || vault.state === VaultState.Experimental;
    const [accepted, setAccepted] = useState(!shouldCheckAdvisory);
    const [showFees, setShowFees] = useState(false);
    const [amount, setAmount] = useState('0');
    const { onValidChange, inputProps } = useNumericInput();
    const classes = useStyles();

    // TODO: update this - it wasn't working anyways
    const isLoading = false;
    const userBalance = user.getBalance(vault.underlyingToken);
    const deposit = TokenBalance.fromString(userBalance, amount);
    // const vaultCaps = user.vaultCaps[vault.vaultToken];

    const canDeposit =
      wallet.isConnected && !!amount && deposit.tokenBalance.gt(0);

    // if (canDeposit && vaultCaps) {
    //   const vaultHasSpace = vaultCaps.vaultCap.tokenBalance.gte(
    //     depositBalance.tokenBalance,
    //   );
    //   const userHasSpace = vaultCaps.userCap.tokenBalance.gte(
    //     depositBalance.tokenBalance,
    //   );
    //   const userHasBalance = userBalance.tokenBalance.gte(
    //     depositBalance.tokenBalance,
    //   );
    //   canDeposit = vaultHasSpace && userHasSpace && userHasBalance;
    // }

    const handlePercentageChange = (percent: number) => {
      setAmount(userBalance.scaledBalanceDisplay(percent));
    };

    const handleSubmit = async (): Promise<void> => {
      if (!amount) {
        return;
      }

      const depositToken = vaults.getToken(vault.underlyingToken);
      const toastId = `${vault.vaultToken}-deposit-${amount}`;
      const approveId = `${vault.vaultToken}-approve-${amount}`;
      const depositAmount = `${formatBalance(amount).toFixed(2)} ${
        depositToken.symbol
      }`;

      const handleTransferSigned = ({
        transaction,
      }: TokenActionCallbackInput) => {
        toast.update(toastId, {
          type: 'info',
          render: `Submitted deposit of ${depositAmount}`,
        });
        if (transaction) {
          transactions.addSignedTransaction(transaction.hash, {
            addedTime: Date.now(),
            name: 'Deposit',
            description: depositAmount,
          });
        }
      };

      const handleTransferCompleted = ({
        receipt,
      }: TokenActionCallbackInput) => {
        let toastConfig: UpdateOptions = {
          type: receipt?.status === 0 ? 'error' : 'success',
          render: `Completed deposit of ${depositAmount}`,
        };

        if (receipt) {
          transactions.updateCompletedTransaction(receipt);
          toastConfig = {
            position: 'top-right',
            type: receipt.status === 0 ? 'error' : 'success',
            render: (
              <TxCompletedToast
                name={`Deposit ${depositAmount}`}
                receipt={receipt}
              />
            ),
          };
        }

        toast.update(toastId, toastConfig);
      };

      const result = await sdk.vaults.deposit({
        vault: vault.vaultToken,
        amount: deposit.tokenBalance,
        onApprovePrompt: () =>
          toast.info('Confirm approval of tokens for deposit', {
            toastId: approveId,
          }),
        onApproveSigned: () =>
          toast.update(approveId, {
            type: 'info',
            render: 'Submitted approval of tokens for deposit',
          }),
        onApproveSuccess: () =>
          toast.update(approveId, {
            type: 'success',
            render: 'Completed approval of tokens for deposit',
          }),
        onTransferPrompt: ({ token, amount }) =>
          toast.info(
            `Confirm deposit of ${formatBalance(amount).toFixed(2)} ${token}`,
            { toastId },
          ),
        onTransferSigned: ({ token, amount }) =>
          toast.info(
            `Submitted desposit of ${formatBalance(amount).toFixed(
              2,
            )} ${token}`,
          ),
        onTransferSuccess: handleTransferCompleted,
        onError: (err) => toast.error(`Failed vault deposit, error: ${err}`),
        onRejection: () =>
          toast.update(toastId, {
            type: 'warning',
            render: 'Deposit transaction canceled by user',
          }),
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
        <Dialog
          open={open}
          onClose={() => vaultDetail.toggleDepositDialog()}
          fullWidth
          maxWidth="xl"
        >
          <VaultDialogTitle vault={vault} mode="Deposit" />
          <VaultAdvisory
            vault={vault}
            accept={() => setAccepted(true)}
            type={advisory}
          />
        </Dialog>
      );
    }

    if (showFees) {
      return (
        <Dialog
          open={open}
          onClose={() => vaultDetail.toggleDepositDialog()}
          fullWidth
          maxWidth="xl"
        >
          <DepositFeesInformation
            closeIcon={
              <Button
                color="primary"
                onClick={() => setShowFees(false)}
                className={classes.backButton}
              >
                <ArrowRightAltIcon className={classes.arrowIcon} />
                Back
              </Button>
            }
          />
        </Dialog>
      );
    }

    return (
      <Dialog
        open={open}
        onClose={() => vaultDetail.toggleDepositDialog()}
        fullWidth
        maxWidth="xl"
      >
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
              <PercentageSelector
                size="small"
                options={[25, 50, 75, 100]}
                onChange={handlePercentageChange}
              />
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
          <VaultFees
            vault={vault}
            className={classes.fees}
            onHelpClick={() => setShowFees(true)}
          />
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
        {/* {user.vaultCaps[vault.vaultToken] && (
          <VaultAvailableDeposit
            vaultCapInfo={user.vaultCaps[vault.vaultToken]}
          />
        )} */}
      </Dialog>
    );
  },
);
