import { VaultDTO, VaultState } from '@badger-dao/sdk';
import { Button, Dialog, DialogContent, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { AdvisoryType } from 'mobx/model/vaults/advisory-type';
import { BadgerVault } from 'mobx/model/vaults/badger-vault';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';
import { useNumericInput } from 'utils/useNumericInput';

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
	badgerVault: BadgerVault;
	onClose: () => void;
}

export const VaultDeposit = observer(({ open = false, vault, badgerVault, onClose }: VaultModalProps) => {
	const store = useContext(StoreContext);
	const { user, wallet } = store;

	const shouldCheckAdvisory = badgerVault.depositAdvisory || vault.state === VaultState.Experimental;
	const [accepted, setAccepted] = useState(!shouldCheckAdvisory);
	const [showFees, setShowFees] = useState(false);
	const [amount, setAmount] = useState('');
	const { onValidChange, inputProps } = useNumericInput();
	const classes = useStyles();

	// TODO: update this - it wasn't working anyways
	const isLoading = false;
	const userBalance = user.getBalance(vault.underlyingToken);
	const depositBalance = TokenBalance.fromBalance(userBalance, Number(amount ?? '0'));
	const vaultCaps = user.vaultCaps[vault.vaultToken];

	let canDeposit = wallet.isConnected && !!amount && depositBalance.tokenBalance.gt(0);

	if (canDeposit && vaultCaps) {
		const vaultHasSpace = vaultCaps.vaultCap.tokenBalance.gte(depositBalance.tokenBalance);
		const userHasSpace = vaultCaps.userCap.tokenBalance.gte(depositBalance.tokenBalance);
		const userHasBalance = userBalance.tokenBalance.gte(depositBalance.tokenBalance);
		canDeposit = vaultHasSpace && userHasSpace && userHasBalance;
	}

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = async (): Promise<void> => {
		if (!amount) {
			return;
		}
	};

	if (!accepted && shouldCheckAdvisory) {
		let advisory = badgerVault.depositAdvisory;
		if (!advisory) {
			advisory = AdvisoryType.Chadger;
		}
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
				<VaultDialogTitle vault={vault} mode="Deposit" />
				<VaultAdvisory vault={vault} accept={() => setAccepted(true)} type={advisory} />
			</Dialog>
		);
	}

	if (showFees) {
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
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
					showNoFees={false}
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
			{user.vaultCaps[vault.vaultToken] && (
				<VaultAvailableDeposit vaultCapInfo={user.vaultCaps[vault.vaultToken]} />
			)}
		</Dialog>
	);
});
