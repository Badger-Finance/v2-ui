import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Grid, Dialog, Typography, DialogContent, Button } from '@material-ui/core';
import { BadgerVault } from 'mobx/model/vaults/badger-vault';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { useNumericInput } from 'utils/useNumericInput';
import { VaultDialogTitle } from './VaultDialogTitle';
import { VaultAvailableDeposit } from './VaultAvailableDeposit';
import { PercentageSelector } from '../PercentageSelector';
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer } from './styled';
import { makeStyles } from '@material-ui/core/styles';
import { BalanceNamespace } from '../../../web3/config/namespaces';
import { NewVaultWarning } from '../../vault-detail/NewVaultWarning';
import { DepositFeesInformation } from '../DepositFeesInformation';
import { VaultFees } from '../VaultFees';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import VaultAdvisory from './VaultAdvisory';
import { Vault, VaultState } from '@badger-dao/sdk';
import { AdvisoryType } from 'mobx/model/vaults/advisory-type';

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
	vault: Vault;
	badgerVault: BadgerVault;
	onClose: () => void;
}

export const VaultDeposit = observer(({ open = false, vault, badgerVault, onClose }: VaultModalProps) => {
	const store = useContext(StoreContext);
	const { contracts, user, onboard } = store;

	const [accepted, setAccepted] = useState(badgerVault.depositAdvisory ? false : true);
	const [showFees, setShowFees] = useState(false);
	const [amount, setAmount] = useState('');
	const { onValidChange, inputProps } = useNumericInput();
	const classes = useStyles();

	const userBalance = user.getBalance(BalanceNamespace.Token, badgerVault);
	const depositBalance = TokenBalance.fromBalance(userBalance, amount ?? '0');
	const vaultCaps = user.vaultCaps[vault.vaultToken];
	const isLoading = contracts.settsBeingDeposited[vault.vaultToken];

	let canDeposit = onboard.isActive() && !!amount && depositBalance.tokenBalance.gt(0);

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
		await contracts.deposit(vault, badgerVault, userBalance, depositBalance);
	};

	if (!accepted && badgerVault.depositAdvisory) {
		let advisory = badgerVault.depositAdvisory;
		if (!advisory && (vault.state === VaultState.Guarded || vault.state === VaultState.Experimental)) {
			advisory = AdvisoryType.Chadger;
		}
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
				<VaultDialogTitle vault={vault} mode="Deposit" />
				<VaultAdvisory accept={() => setAccepted(true)} type={badgerVault.depositAdvisory} />
			</Dialog>
		);
	}

	if (showFees) {
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
