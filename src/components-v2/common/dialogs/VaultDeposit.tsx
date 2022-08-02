import { TransactionStatus, VaultDTO, VaultState } from '@badger-dao/sdk';
import { Box, Button, Dialog, DialogContent, Grid, TextField, Typography } from '@material-ui/core';
import { makeStyles, styled } from '@material-ui/core/styles';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import VaultLogo from 'components-v2/landing/VaultLogo';
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
import { ActionButton, LoaderSpinner, PercentagesContainer } from './styled';
import VaultAdvisory from './VaultAdvisory';
import { VaultAvailableDeposit } from './VaultAvailableDeposit';
import { VaultDialogTitle } from './VaultDialogTitle';

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(0, 3, 3, 3),
    color: 'rgba(255,255,255,0.6)',
  },
  guardedVault: {
    marginBottom: theme.spacing(2),
  },
  fees: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(0, 2),
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

  tokenBox: {
    background: '#121212',
    borderRadius: 8,
    padding: '15px 20px 25px',
    '& .token-label': {
      fontSize: 12,
      marginBottom: 5,
    },
    '& .token-logo-name': {
      border: '1px solid #FFFFFF',
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
    },
    '& .token-balance-percentage': {
      marginTop: 20,
      '& .token-balance': {
        fontSize: 12,
      },
    },
  },
}));

const DepositButton = styled(ActionButton)(({ theme }) => ({
  textTransform: 'none',
  '& span': {
    textTransform: 'none',
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
  const { user, wallet, sdk, vaultDetail, transactions, vaults, prices } = store;

  const shouldCheckAdvisory = depositAdvisory || vault.state === VaultState.Experimental;
  const [accepted, setAccepted] = useState(!shouldCheckAdvisory);
  const [showFees, setShowFees] = useState(false);
  const [amount, setAmount] = useState('0');
  const { onValidChange, inputProps } = useNumericInput();
  const classes = useStyles();

  // TODO: update this - it wasn't working anyways
  const isLoading = false;
  const userBalance = user.getBalance(vault.underlyingToken);
  const deposit = TokenBalance.fromString(userBalance, amount === '' ? '0' : amount);
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
        <VaultDialogTitle vault={vault} mode="Deposit" onClose={() => vaultDetail.toggleDepositDialog()} />
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
      <VaultDialogTitle vault={vault} mode="Deposit" onClose={onClose} />
      <DialogContent className={classes.content}>
        {vault.state === VaultState.Guarded && (
          <Grid container className={classes.guardedVault}>
            <NewVaultWarning />
          </Grid>
        )}
        <Box className={classes.tokenBox}>
          <Typography className="token-label">Token</Typography>
          <Grid container>
            <Grid item xs={7}>
              <Box className="token-logo-name" display="flex" alignItems="center">
                <VaultLogo tokens={vault.tokens} />
                <Typography className="token-name">{vault.name}</Typography>
              </Box>
            </Grid>
            <Grid item xs={5}>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Type an amount to deposit"
                inputProps={inputProps}
                value={amount || ''}
                onChange={onValidChange(setAmount)}
                className={`${classes.amountTextField} ${
                  Number(amount) || amount.length > 1 ? classes.amountTextFieldHasValue : ''
                }`}
              />
              <Box display="flex" justifyContent="flex-end" className={classes.amountDollarValue}>
                <Typography>~${amount ? Number(amount) * prices.getPrice(vault.underlyingToken) : amount}</Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid container alignItems="center" className="token-balance-percentage">
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" color="textSecondary" className="token-balance">
                {`Balance: ${userBalance.balanceDisplay()}`}
              </Typography>
            </Grid>
            <PercentagesContainer item xs={12} sm={6}>
              <PercentageSelector size="small" options={[25, 50, 75, 100]} onChange={handlePercentageChange} />
            </PercentagesContainer>
          </Grid>
        </Box>
        <VaultFees vault={vault} className={classes.fees} onHelpClick={() => setShowFees(true)} />
        <Grid container className={classes.totalAmountContainer}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" className={classes.totalAmountLabel}>
              Total Deposit
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" justifyContent="flex-end" className={classes.totalAmount}>
              {amount}
            </Box>
          </Grid>
        </Grid>
        <DepositButton
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
            `DEPOSIT ${vault.asset}`
          )}
        </DepositButton>
      </DialogContent>
      {vaultCaps && <VaultAvailableDeposit asset={vault.asset} vaultCaps={vaultCaps} />}
    </Dialog>
  );
});
